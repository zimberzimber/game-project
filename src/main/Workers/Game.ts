import { EntityBase, GameEntityBase, UiEntityBase } from "../Entities/EntityBase";
import { ComponentBase } from "../Components/ComponentBase";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { Input } from "./InputHandler";
import { Camera, } from "./CameraManager";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { Rendering } from "./RenderingPipeline";
import { Light } from "../Components/Visual/Light";
import { DrawDirectiveBase } from "../Components/Visual/DrawDirectiveBase";
import { StateManager } from "./GameStateManager";
import { IsPointInPolygon } from "./CollisionChecker";

class GameManager implements IConfigObserver {
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

    private _nextEntityId: number = 0;
    get NextEntityId(): number {
        const returned = this._nextEntityId;

        if (this._nextEntityId < Number.MAX_SAFE_INTEGER) {
            this._nextEntityId++;
        } else {
            for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
                if (!this._entities[i]) {
                    this._nextEntityId = i;
                    break;
                }
            }
        }

        return returned;
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
        this._entities[entity.entityId] = entity;
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

    GetEntitiesInRadius(origin: Vec2, radius: number): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            if (e instanceof GameEntityBase && Vec2Utils.Distance(origin, e.worldRelativeTransform.Position) <= radius)
                entities.push(e);
        });

        return entities;
    }

    GetEntitiesInPolygon(polygon: Vec2[]): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            if (e instanceof GameEntityBase && IsPointInPolygon(e.worldRelativeTransform.Position, polygon))
                entities.push(e);
        });

        return entities;
    }
    
    GetEntitiesInRectangle(bottomLeft: Vec2, topRight: Vec2): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            const pos = e.worldRelativeTransform.Position;
            if (e instanceof GameEntityBase
                && pos[0] >= bottomLeft[0] && pos[0] <= topRight[0]
                && pos[1] >= bottomLeft[1] && pos[1] <= topRight[1])
                entities.push(e);
        });

        return entities;
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

        StateManager.StateUpdate(this._updateDelta);

        // Split entities into game and ui collections
        const allEntities = Game.GetAllEntities();
        const gameEntities: GameEntityBase[] = [];
        const uiEntities: UiEntityBase[] = [];

        allEntities.forEach(e => {
            if (e instanceof GameEntityBase)
                gameEntities.push(e);
            else if (e instanceof UiEntityBase)
                uiEntities.push(e);
        });


        // Collect scene draw data
        const sceneDDs = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveBase, gameEntities, true);
        const sceneData = {}

        sceneDDs.forEach((dd: DrawDirectiveBase) => {
            // Skip directives outside of view
            const dTrans = dd.Parent.worldRelativeTransform

            if (Camera.IsInView(dTrans.Position, dd.BoundingRadius)) {
                let indexOffset = 0;

                if (sceneData[dd.ImageId])
                    // || 0 in case of getting empty data first
                    indexOffset = sceneData[dd.ImageId].indexes[sceneData[dd.ImageId].indexes.length - 1] + 1 || 0;
                else
                    sceneData[dd.ImageId] = { attributes: [], indexes: [] };

                sceneData[dd.ImageId].attributes.push(...dd.WebGlData.attributes);
                for (const ind of dd.WebGlData.indexes)
                    sceneData[dd.ImageId].indexes.push(ind + indexOffset);
            }
        });

        Rendering.SetDrawData('scene', sceneData)

        const uiDDs = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveBase, uiEntities, true);
        const uiData = {}

        // Collect UI draw data
        uiDDs.forEach((dd: DrawDirectiveBase) => {
            // Skip directives outside of view
            const dTrans = dd.Parent.worldRelativeTransform

            if (Camera.IsInView(dTrans.Position, dd.BoundingRadius)) {
                let indexOffset = 0;

                if (uiData[dd.ImageId])
                    indexOffset = uiData[dd.ImageId].indexes[uiData[dd.ImageId].indexes.length - 1] + 1;
                else
                    uiData[dd.ImageId] = { attributes: [], indexes: [] };

                uiData[dd.ImageId].attributes.push(...dd.WebGlData.attributes);
                for (const ind of dd.WebGlData.indexes)
                    uiData[dd.ImageId].indexes.push(ind + indexOffset);
            }
        });

        Rendering.SetDrawData('ui', uiData)

        // Collect lighting data for scene (UI doesn't support lighting)
        const lights: number[] = [];
        Game.GetAllComponentsOfTypeFromEntityCollection(Light, gameEntities, true).forEach((l: Light) => {
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