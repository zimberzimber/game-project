import { EntityBase } from "../Bases/EntityBase";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { CheckCollision, IsPointInCollider, IsPointInPolygon } from "./CollisionChecker";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { TestEntity } from "../Entities/Test";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { SoundTags } from "../Models/SoundModels";
import { Audio } from "./SoundPlayer";
import { Input } from "./InputHandler";
import { Settings } from "./SettingsManager";
import { Test2Entity } from "../Entities/Test2";
import { Camera, } from "./CameraManager";
import { Rendering } from "./RenderingPipeline";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { Light } from "../Components/Light/Light";

class GameManager implements IConfigObserver {
    private _canvas: HTMLCanvasElement;
    private _entities: EntityBase[] = [];
    private _paused: boolean = false;
    private _debugDraw: boolean = Config.GetConfig('debugDraw', false);

    // Used for game logic
    private readonly _minimumUpdateDelta = 1 / 30; // Required to prevent some unwanted behaviors at extreme cases
    private _updateDelta: number = 0;
    private _oldUpdateTime: number = Date.now();
    private _mousePosition: Vec2 = [0, 0];

    // Used for FPS display
    private _displayFps: boolean = Config.GetConfig('debug', false);
    private _frameTimes: number[] = [];
    private _lastFpsDisplayTime: number = Date.now();

    get UpdateDelta(): number { return this._updateDelta; }

    get Paused(): boolean { return this._paused; }
    set Paused(paused: boolean) {
        if (this._paused == paused) return;

        this._paused = paused;
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

    /** World relative mouse position */
    get MousePosition(): Vec2 { return this._mousePosition; }

    Start(): void {
        this._canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
        this._canvas.width = 600;
        this._canvas.height = 500;

        Rendering.Init(this._canvas);

        Camera.Transform.Scale = [this._canvas.width, this._canvas.height];
        Camera.Transform.Position = [0, 0];
        Camera.Transform.Rotation = 0;
        Camera.ManualUpdate();

        Config.Observable.Subscribe(this);

        this._entities = [];
        let p = new PlayerEntity();
        this.AddEntity(p);

        let test = new TestEntity();
        test.transform.Position = [100, 100];
        test.transform.Scale = [5, 5];
        this.AddEntity(test);

        const n = 0;
        for (let x = 0; x < n; x++) {
            for (let y = 0; y < n; y++) {
                let test2 = new Test2Entity();
                test2.transform.Position = [(-n + x) * 7, (-n + y) * 7];
                test2.transform.Scale = [0.25, 0.25];
                this.AddEntity(test2);
            }
        }

        Input.MouseElement = this._canvas;
        Input.Keymap = Settings.GetSetting('controlsKeymap');

        Audio.PlaySound({
            soundSourceName: 'loop2',
            volume: 0.1,
            playbackRate: 1,
            loop: true,
            tag: SoundTags.Music,
        });

        requestAnimationFrame(this.Update.bind(this))
    }

    OnObservableNotified(args: IConfigEventArgs): void {
        switch (args.field) {
            case 'debug':
                this._displayFps = args.newValue;
                break;
            case 'debugDraw':
                this._debugDraw = args.newValue;
                break;
        }
    }

    // Add an entity to the root of the entity tree.
    AddEntity(entity: EntityBase): void {
        this._entities.push(entity);
    }

    GetEntityById(id: number): EntityBase | null {
        const e = this.GetAllEntities().filter(e => e.entityId == id);
        if (e[0])
            return e[0];
        return null;
    }

    GetEntityTreeString(): string {
        let str = '';
        this._entities.forEach(e => {
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
        this._entities.forEach(entity => {
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
        if (this._paused) return;

        const newFrameTime = new Date().getTime();
        this._updateDelta = Math.min((newFrameTime - this._oldUpdateTime) / 1000, this._minimumUpdateDelta);
        this._oldUpdateTime = newFrameTime;

        // Set world relative mouse position
        this._mousePosition = Vec2Utils.Sum(Vec2Utils.RotatePoint(Input.MousePosition, -Camera.Transform.RotationRadian), Camera.Transform.Position);

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

        const viewCenter = Camera.Transform.Position
        const viewPolyline = Camera.ViewPolyline;

        const drawData = {}
        dds.forEach((dd: ImageDrawDirective) => {
            // Skip directives outside of view
            const dTrans = dd.Parent.worldRelativeTransform
            const dRadius = Math.sqrt(Math.pow(dd.size[0] * dTrans.Scale[0], 2) + Math.pow(dd.size[1] * dTrans.Scale[1], 2))

            if (this.IsInView(dTrans.Position, dRadius)) {
                if (!drawData[dd.ImageId])
                    drawData[dd.ImageId] = { attributes: [], indexes: [] };

                const s = drawData[dd.ImageId].indexes.length / 6 * 4;
                drawData[dd.ImageId].attributes.push(...dd.WebGlData);
                drawData[dd.ImageId].indexes.push(
                    s, s + 1, s + 2,
                    s, s + 2, s + 3
                );
            }
        });
        Rendering.SetDrawData('scene', drawData)

        const lines: { red: number[][], yellow: number[][] } = { red: [], yellow: [] };
        if (this._debugDraw) {
            const hitboxes = this.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true) as HitboxBase[];
            hitboxes.forEach((hb: HitboxBase) => {
                // Skip draws outside of view
                const hTrans = hb.Parent.worldRelativeTransform;
                const hRadius = hb.HitboxOverallRadius * Math.max(hb.Parent.worldRelativeTransform.Scale[0], hb.Parent.worldRelativeTransform.Scale[1]);

                if (this.IsInView(hTrans.Position, hRadius)) {
                    const hData: number[] | null = hb.DebugDrawData;
                    if (hData) {
                        if (hb.TriggerState == TriggerState.NotTrigger) {
                            lines.yellow.push(hData)
                        } else {
                            lines.red.push(hData)
                        }
                    }
                }
            })
        }
        Rendering.SetDrawData('debug', lines)

        const lights: number[] = [];
        this.GetAllComponentsOfTypeFromEntityCollection(Light, allEntities, true).forEach((l: Light) => lights.push(...l.WebglData));
        Rendering.SetDrawData('lighting', lights)


        // Rendering.SetUniformData('post', 'u_offsetPower', [Math.abs(Math.sin(Date.now() * 0.001)) / 2]);
        Rendering.Render()

        if (this._displayFps) {
            const fps = this.FPSUpdate();
            const time = Date.now();

            if (time - this._lastFpsDisplayTime >= 250) {
                this._lastFpsDisplayTime = time;
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
        while (this._frameTimes.length > 0 && this._frameTimes[0] <= time - 1000)
            this._frameTimes.shift();

        this._frameTimes.push(time);
        return this._frameTimes.length;
    }

    FPSReletive(value: number): number {
        return value * this._updateDelta;
    }

    IsInView(point: Vec2, radius: number): boolean {
        return IsPointInPolygon(Vec2Utils.MoveTowards(point, Camera.Transform.Position, radius, false), Camera.ViewPolyline);
    }
}

export const Game: GameManager = new GameManager();