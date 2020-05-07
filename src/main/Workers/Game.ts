import { EntityBase } from "../Bases/EntityBase";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { CheckCollision, IsPointInCollider } from "./CollisionChecker";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { TestEntity } from "../Entities/Test";
import { WebglDrawData } from "../Models/WebglDrawData";
import { ShaderSources } from "../Proxies/ShaderSourcesProxy";
import { Config } from "../Proxies/ConfigProxy";
import { Images } from "./ImageManager";
import { SoundTags } from "../Models/SoundModels";
import { Audio } from "./SoundPlayer";
import { Input } from "./InputHandler";
import { Settings } from "./SettingsManager";
import { Test2Entity } from "../Entities/Test2";
import { Webgl } from "./WebglManager";
import { IMouseInputObserver } from "../Models/InputModels";
import { Vec2 } from "../Models/Vec2";

class GameManager {
    canvas: HTMLCanvasElement;
    entities: EntityBase[] = [];
    paused: boolean = false;
    _debugDraw: boolean = Config.GetConfig('debugDraw', false);

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

        Webgl.Init(ShaderSources.VertexShader, ShaderSources.FragmentShader, this.canvas, Images.GetImageArray())

        Config.Subscribe('debug', (newValue: boolean) => this.displayFps = newValue);
        Config.Subscribe('debugDraw', (newValue: boolean) => this._debugDraw = newValue);

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

            //newE.transform.Scale = [0.5, 1.5];
            newE.transform.Position = [50, 50];
            newE.transform.Rotation = 45;
            p.AddChildEntity(newE);
            p = newE;
        }

        let test = new TestEntity();
        test.transform.Position = [100, 100];
        test.transform.Scale = [5, 5];
        this.AddEntity(test);

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                let test2 = new Test2Entity();
                test2.transform.Position = [(-5 + x) * 10, (-5 + y) * 10];
                this.AddEntity(test2);
            }
        }

        Input.MouseElemet = this.canvas;
        Input.Keymap = Settings.GetSetting('controlsKeymap');

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
        parent.Children.forEach(c => {
            str = `${str}\n${this.GetEntityTreeStringHelper(c, depth + 1)}`
        });
        return str;
    }

    // Function returning a collection of all the entities within the game. Utilizes 'GetAllEntitiesHelper'.
    GetAllEntities(): EntityBase[] {
        let entities: EntityBase[] = [];
        this.entities.forEach(entity => {
            entities.push(entity);
            if (entity.Children.length > 0)
                entities.push(...this.GetAllEntitiesHelper(entity));
        });
        return entities;
    }

    // Recursive helper function for obtaining children of a give parent entity.
    private GetAllEntitiesHelper(parent: EntityBase): EntityBase[] {
        let children: EntityBase[] = [];
        parent.Children.forEach(child => {
            children.push(child);
            if (child.Children.length > 0)
                children.push(...this.GetAllEntitiesHelper(child));
        })
        return children;
    }

    // Get components of a certain type from all the entities within the game.
    // Calls 'GetAllEntities' to obtain all the current entities, and passes that as a collection to 'GetAllComponentsOfTypeFromEntityCollection'
    GetAllComponentsOfType(type: any, activeOnly: boolean = false): ComponentBase[] {
        return this.GetAllComponentsOfTypeFromEntityCollection(type, this.GetAllEntities(), activeOnly);
    }

    // Get components of a certain type from the given collection.
    GetAllComponentsOfTypeFromEntityCollection(type: any, collection: EntityBase[], activeOnly: boolean = false): ComponentBase[] {
        let returned: ComponentBase[] = [];
        collection.forEach(e => returned.push(...e.GetComponentsOfType(type, activeOnly)));
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
        let triggers: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true).filter(c => (c as HitboxBase).TriggerState != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true).filter(c => (c as HitboxBase).TriggerState == TriggerState.NotTrigger) as HitboxBase[];

        for (let i = 0; i < triggers.length; i++) {
            const t = triggers[i];
            if (t.CollisionGroup == CollisionGroup.None && t.CollideWithGroup == CollisionGroup.None)
                continue;

            for (let j = i + 1; j < triggers.length; j++) {
                const c = triggers[j];
                if (c.CollisionGroup == CollisionGroup.None && c.CollideWithGroup == CollisionGroup.None)
                    continue;

                if (t.CollideWithGroup & c.CollisionGroup && CheckCollision(t, c))
                    t.CollideWith(c);

                if (t.CollisionGroup & c.CollideWithGroup && CheckCollision(t, c))
                    c.CollideWith(t);
            }

            for (let j = 0; j < colliders.length; j++) {
                const c = colliders[j];
                if (c.CollisionGroup == CollisionGroup.None && c.CollideWithGroup == CollisionGroup.None)
                    continue;

                if (t.CollideWithGroup & c.CollisionGroup && CheckCollision(t, c))
                    t.CollideWith(c);

                if (t.CollisionGroup & c.CollideWithGroup && CheckCollision(t, c))
                    c.CollideWith(t);
            }
        }

        // Collect all drawing data:
        const dds = this.GetAllComponentsOfTypeFromEntityCollection(ImageDrawDirective, allEntities, true);
        const triangleData: WebglDrawData = {
            vertexes: [],
            indexes: [],
        };

        for (let i = 0; i < dds.length; i++) {
            triangleData.vertexes.push(...(dds[i] as ImageDrawDirective).WebGlData);

            const s = i * 4;
            triangleData.indexes.push(
                s, s + 1, s + 2,
                s, s + 2, s + 3
            );
        }

        Webgl.TriangleData = triangleData;

        // Draw collisions if the option is enabled
        if (this._debugDraw) {
            let indexOffset = triangleData.indexes[triangleData.indexes.length - 1] + 1;
            const lineData: WebglDrawData[] = [];
            const hitboxes = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true) as HitboxBase[];

            for (let i = 0; i < hitboxes.length; i++) {
                const hData: WebglDrawData | null = hitboxes[i].DebugDrawData;
                if (hData) {
                    for (let j = 0; j < hData.indexes.length; j++)
                        hData.indexes[j] += indexOffset;

                    indexOffset += hData.indexes.length - 2;
                    lineData.push(hData);
                }
                indexOffset += 1;
            }

            Webgl.LineData = lineData;
        } else
            Webgl.LineData = [];


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

    private readonly _minimumFrameDelta = 1 / 30;
    FPSReletive(value: number): number {
        // Need the limit to prevent some unwanted behaviors at lower
        return value * Math.min(this.frameDelta, this._minimumFrameDelta);
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

    private updateEvents: any = [];
    AddUpdateEvent(event): void {
        this.updateEvents.push(event);
    }

    RemoveUpdateEvent(): void {
        this.updateEvents.push(event);
    }
}

export const Game: GameManager = new GameManager();