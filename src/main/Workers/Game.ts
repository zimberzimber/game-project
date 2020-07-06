import { EntityBase } from "../Entities/EntityBase";
import { ComponentBase } from "../Components/ComponentBase";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { Input } from "./InputHandler";
import { Camera, } from "./CameraManager";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { GameStateBase } from "../GameStates/GameStateBase";
import { Rendering } from "./RenderingPipeline";
import { DrawDirectiveImageBase } from "../Components/DrawDirectives/DrawDirectiveImageBase";
import { DrawDirectiveText } from "../Components/DrawDirectives/DrawDirectiveText";
import { Images } from "./ImageManager";
import { Light } from "../Components/Light/Light";

class GameManager implements IConfigObserver {
    private _canvas: HTMLCanvasElement;
    private _entities: EntityBase[] = [];

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

    /** World relative mouse position */
    get MousePosition(): Vec2 { return this._mousePosition; }

    private state: GameStateBase;
    get GameState(): GameStateBase { return this.state; }
    set GameState(state: GameStateBase) {
        if (this.state)
            this.state.OnDeactivated();
        this.state = state;
        this.state.OnActivated();
    }

    constructor() {
        Config.Observable.Subscribe(this);
    }

    OnObservableNotified(args: IConfigEventArgs): void {
        switch (args.field) {
            case 'debug':
                this._displayFps = args.newValue;
                break;
        }
    }

    // Add an entity to the entity tree root
    AddEntity(entity: EntityBase): void {
        this._entities.push(entity);
    }

    // Remove an entity
    RemoveEntity(entity: EntityBase): void {
        if (this._entities[entity.entityId]) {
            delete this._entities[entity.entityId];
        }
        entity.Delete();
    }

    IsRootEntity(entity: EntityBase): boolean {
        return this._entities[entity.entityId] ? true : false;
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

        const newFrameTime = new Date().getTime();
        this._updateDelta = Math.min((newFrameTime - this._oldUpdateTime) / 1000, this._minimumUpdateDelta);
        this._oldUpdateTime = newFrameTime;

        // Set world relative mouse position
        this._mousePosition = Vec2Utils.Sum(Vec2Utils.RotatePoint(Input.MousePosition, -Camera.Transform.RotationRadian), Camera.Transform.Position);

        this.state.Update(this._updateDelta);

        // Collect all drawing data:
        const allEntities = Game.GetAllEntities();
        const dds = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveImageBase, allEntities, true);
        const tds = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveText, allEntities, true);

        const drawData = {}
        dds.forEach((dd: DrawDirectiveImageBase) => {
            // Skip directives outside of view
            const dTrans = dd.Parent.worldRelativeTransform
            const dRadius = Math.sqrt(Math.pow(dd.size[0] * dTrans.Scale[0], 2) + Math.pow(dd.size[1] * dTrans.Scale[1], 2))

            if (Camera.IsInView(dTrans.Position, dRadius)) {
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

        const uiDrawData = {}
        const charsId = Images.GetImageIdFromName('font');
        let chars = 0;
        uiDrawData[charsId] = { attributes: [], indexes: [] };
        tds.forEach((td: DrawDirectiveText) => {
            uiDrawData[charsId].attributes.push(...td.WebGlData);
            for (let i = 0; i < td.WebGlData.length / (5 * 4); i++) {
                const s = chars * 4;
                uiDrawData[charsId].indexes.push(
                    s, s + 1, s + 2,
                    s, s + 2, s + 3
                );
                chars++;
            }
        });

        Rendering.SetDrawData('scene', drawData)
        Rendering.SetDrawData('ui', uiDrawData)

        const lights: number[] = [];
        Game.GetAllComponentsOfTypeFromEntityCollection(Light, allEntities, true).forEach((l: Light) => {
            if (Camera.IsInView(l.Parent.worldRelativeTransform.Position, l.Radius))
                lights.push(...l.WebglData);
        });
        Rendering.SetDrawData('lighting', lights)


        // Rendering.SetUniformData('post', 'u_offsetPower', [Math.abs(Math.sin(Date.now() * 0.001)) / 2]);
        Rendering.Render()
        
        if (this._displayFps) {
            const time = Date.now();

            while (this._frameTimes.length > 0 && this._frameTimes[0] <= time - 1000)
                this._frameTimes.shift();
            this._frameTimes.push(time);

            const fps = this._frameTimes.length;
            if (time - this._lastFpsDisplayTime >= 250) {
                this._lastFpsDisplayTime = time;
                const element = document.getElementById('fps-counter');
                if (element)
                    element.innerHTML = fps.toString();
            }
        }
    }
}

export const Game: GameManager = new GameManager();