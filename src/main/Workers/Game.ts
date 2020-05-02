import { EntityBase } from "../Bases/EntityBase";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Bases/HitboxBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { TriggerState } from "../Models/TriggerState";
import { CheckCollision } from "./HitboxCollisionChecker";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { TestEntity } from "../Entities/Test";
import { WebglDrawData } from "../Models/WebglDrawData";
import { Webgl } from "../Proxies/WebglProxy";
import { ShaderSources } from "../Proxies/ShaderSourcesProxy";
import { Config } from "../Proxies/ConfigProxy";
import { Images } from "./ImageManager";
import { SoundTags } from "../Models/SoundModels";
import { Audio } from "./SoundPlayer";
import { Input } from "./InputHandler";
import { Settings } from "./SettingsManager";

class GameManager {
    canvas: HTMLCanvasElement;
    entities: EntityBase[] = [];
    paused: boolean = false;

    // Used for game logic
    frameDelta: number = 0;
    oldFrameTime: number = Date.now();

    // Used for FPS display
    displayFps: boolean = Config.GetConfig('debug', false);
    frameTimes: number[] = [];
    lastFpsDisplayTime: number = Date.now();

    Start(): void {
        this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        this.canvas.width = 600;
        this.canvas.height = 500;

        Webgl.Init(ShaderSources.GetVertexShader(), ShaderSources.GetFragmentShader(), this.canvas, Images.GetImageArray())

        this.entities = [];
        let p = new PlayerEntity();
        this.AddEntity(p);

        const count = 0;
        for (let i = 0; i < count; i++) {
            let newE: EntityBase;

            if (i % 2 == 0)
                newE = new TestEntity();
            else
                newE = new PlayerEntity();

            newE.transform.scale = [0.5, 1.5];
            newE.transform.position[0] = 30;
            p.AddChildEntity(newE);
            p = newE;
        }

        let test = new TestEntity();
        test.transform.position = [100, 100];
        test.transform.scale = [5, 5];
        this.AddEntity(test);

        Input.BindKeymap(Settings.GetSetting('controlsKeymap'));
        Audio.PlaySound({
            soundSourceName: 'loop2',
            volume: 0.5,
            playbackRate: 1,
            loop: true,
            tag: SoundTags.Music,
        });

        requestAnimationFrame(this.Update.bind(this))
    }

    // Add an entity to the root of the entity tree.
    AddEntity(entity: EntityBase): void {
        this.entities.push(entity);
    }

    GetEntityById(id: number): EntityBase | null {
        const e = this.GetAllEntities().filter(e => e.entityId == id);
        if (e[0])
            return e[0];
        return null;
    }

    GetEntityTreeString(): string {
        let str = '';
        this.entities.forEach(e => {
            //@ts-ignore (object.constructor.name is not recognized by TypeScript)
            str = `${str}\n${this.GetEntityTreeStringHelper(e, 0)}`
        });
        return str;
    }

    private GetEntityTreeStringHelper(parent: EntityBase, depth: number): string {
        let str: string = '';
        for (let i = 0; i < depth; i++)
            str = `|${str}`;

        //@ts-ignore (object.constructor.name is not recognized by TypeScript)
        str = `${str}(${parent.entityId})${parent.constructor.name}`;
        parent.GetChildren().forEach(c => {
            str = `${str}\n${this.GetEntityTreeStringHelper(c, depth + 1)}`
        });
        return str;
    }

    // Function returning a collection of all the entities within the game. Utilizes 'GetAllEntitiesHelper'.
    GetAllEntities(): EntityBase[] {
        let entities: EntityBase[] = [];
        this.entities.forEach(entity => {
            entities.push(entity);
            if (entity.GetChildren().length > 0)
                entities = entities.concat(this.GetAllEntitiesHelper(entity));
        });
        return entities;
    }

    // Recursive helper function for obtaining children of a give parent entity.
    private GetAllEntitiesHelper(parent: EntityBase): EntityBase[] {
        let children: EntityBase[] = [];
        parent.GetChildren().forEach(child => {
            children.push(child);
            if (child.GetChildren().length > 0)
                children = children.concat(this.GetAllEntitiesHelper(child));
        })
        return children;
    }

    // Get components of a certain type from all the entities within the game.
    // Calls 'GetAllEntities' to obtain all the current entities, and passes that as a collection to 'GetAllComponentsOfTypeFromEntityCollection'
    GetAllComponentsOfType(type: any): ComponentBase[] {
        return this.GetAllComponentsOfTypeFromEntityCollection(type, this.GetAllEntities());
    }

    // Get components of a certain type from the given collection.
    GetAllComponentsOfTypeFromEntityCollection(type: any, collection: EntityBase[]): ComponentBase[] {
        let returned: ComponentBase[] = [];
        collection.forEach(e => returned = returned.concat(e.GetComponentsOfType(type)));
        return returned;
    }

    Update(): void {
        requestAnimationFrame(this.Update.bind(this));

        // Do nothing if game is paused
        if (this.paused) return;

        const newFrameTime = new Date().getTime();
        this.frameDelta = (newFrameTime - this.oldFrameTime) / 1000;
        this.oldFrameTime = newFrameTime;

        // Update all entities
        this.GetAllEntities().forEach(e => e.Update());

        // Updating all first and then reobtaining the list because entities may have been created due to other entities updating.
        const allEntities = this.GetAllEntities();
        let triggers: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities).filter(c => (c as HitboxBase).GetTriggerState() != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities).filter(c => (c as HitboxBase).GetTriggerState() == TriggerState.NotTrigger) as HitboxBase[];

        triggers.forEach(t => colliders.forEach(c => { if (CheckCollision(t, c)) t.OnCollision(c); }));

        // Collect all drawing data:
        const dds = this.GetAllComponentsOfType(ImageDrawDirective);
        const triangleData: WebglDrawData = {
            vertexes: [],
            indexes: [],
        };

        for (let i = 0; i < dds.length; i++) {
            triangleData.vertexes = triangleData.vertexes.concat((dds[i] as ImageDrawDirective).GetWebGlData());

            const s = i * 4;
            triangleData.indexes = triangleData.indexes.concat([
                s, s + 1, s + 2,
                s, s + 2, s + 3
            ]);
        }

        Webgl.SetTriangleData(triangleData);

        // Draw collisions if the option is enabled
        if (Config.GetConfig('debugDraw', false) === true) {
            let indexOffset = triangleData.indexes[triangleData.indexes.length - 1] + 1;
            const lineData: WebglDrawData[] = [];
            const hitboxes = this.GetAllComponentsOfType(HitboxBase) as HitboxBase[];

            for (let i = 0; i < hitboxes.length; i++) {
                const hData: WebglDrawData | null = hitboxes[i].GetDebugDrawData()
                if (hData) {
                    for (let j = 0; j < hData.indexes.length; j++)
                        hData.indexes[j] += indexOffset;

                    indexOffset += hData.indexes.length - 2;
                    lineData.push(hData);
                }
                indexOffset += 1;
            }

            Webgl.SetLineData(lineData);
        }

        Webgl.Draw();

        if (this.displayFps) {
            const fps = this.FPSUpdate();
            const time = Date.now();

            if (time - this.lastFpsDisplayTime >= 250) {
                this.lastFpsDisplayTime = time;
                const element = document.getElementById('fps-counter');
                if (element) {
                    element.innerHTML = fps.toString();
                }
            }
        }
    }

    // Taken from https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
    FPSUpdate(): number {
        const time = performance.now()
        while (this.frameTimes.length > 0 && this.frameTimes[0] <= time - 1000)
            this.frameTimes.shift();

        this.frameTimes.push(time);
        return this.frameTimes.length;
    }

    get Paused(): boolean { return this.paused; }
    set Paused(paused: boolean) {
        if (this.paused == paused) return;

        this.paused = paused;
        Audio.PlaySound({
            soundSourceName: 'ui',
            volume: 1,
            playbackRate: 1,
            loop: false,
            tag: SoundTags.UI
        });

        if (paused)
            Audio.SetTagVolume(SoundTags.Music, 0.5);
        else
            Audio.SetTagVolume(SoundTags.Music, 1);
    }

    private updateEvents:any = [];
    AddUpdateEvent(event): void {
        this.updateEvents.push(event);
    }

    RemoveUpdateEvent(): void {
        this.updateEvents.push(event);
    }
}

export const Game: GameManager = new GameManager();