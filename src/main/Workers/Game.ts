import { EntityBase, GameEntityBase, UiEntityBase } from "../Entities/EntityBase";
import { ComponentBase } from "../Components/ComponentBase";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { Input, GamepadHandler } from "./InputHandler";
import { Camera, } from "./CameraManager";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { Rendering } from "./RenderingPipeline";
import { LightComponent } from "../Components/Visual/Light";
import { DrawDirectiveBase } from "../Components/Visual/DrawDirectiveBase";
import { StateManager } from "./GameStateManager";
import { IsPointInPolygon } from "./CollisionChecker";
import { ISceneDrawData } from "../Renderers/SceneRenderer";
import { SortedLinkedList } from "../Utility/Misc";
import { ClassType, IsDebugDrawable } from "../Models/GenericInterfaces";
import { ScalarUtil } from "../Utility/Scalar";

class GameManager implements IConfigObserver {
    private _entities: EntityBase[] = [];

    // Used for game logic
    private readonly _minimumUpdateDelta = 1 / 30; // Required to prevent some unwanted behaviors at extreme cases
    private _updateDelta: number = 0;
    private _oldUpdateTime: number = Date.now();
    private _mousePosition: Vec2 = [0, 0];

    // Used for FPS display
    private _debug: boolean = Config.GetConfig('debug', false);
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
                this._debug = args.newValue;
                break;
        }
    }

    // Add an entity to the entity tree root
    AddEntity(entity: EntityBase): void {
        this._entities[entity.EntityId] = entity;
    }

    // Remove an entity
    RemoveEntity(entity: EntityBase): void {
        if (this._entities[entity.EntityId]) {
            delete this._entities[entity.EntityId];
        }
        entity.Delete();
    }

    RemoveEntities(entities: EntityBase[]): void {
        for (const ent of entities)
            this.RemoveEntity(ent);
    }

    RemoveAllEntities(): void {
        for (const ent of this._entities)
            this.RemoveEntity(ent);
    }

    IsRootEntity(entity: EntityBase): boolean {
        return this._entities[entity.EntityId] ? true : false;
    }

    GetEntityById(id: number): EntityBase | null {
        const e = this.GetAllEntities().filter(e => e.EntityId == id);
        if (e[0])
            return e[0];
        return null;
    }

    GetEntitiesInRadius(origin: Vec2, radius: number, enabledOnly: boolean = true): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            if (e instanceof GameEntityBase && Vec2Utils.Distance(origin, e.WorldRelativeTransform.Position) <= radius)
                entities.push(e);
        });

        return entities;
    }

    GetEntitiesInPolygon(polygon: Vec2[]): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            if (e instanceof GameEntityBase && IsPointInPolygon(e.WorldRelativeTransform.Position, polygon))
                entities.push(e);
        });

        return entities;
    }

    GetEntitiesInRectangle(bottomLeft: Vec2, topRight: Vec2): GameEntityBase[] {
        const entities: GameEntityBase[] = [];

        this.GetAllEntities().forEach(e => {
            const pos = e.WorldRelativeTransform.Position;
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
        str = `${str}(${parent.EntityId})${parent.constructor.name}`;
        parent.Children.forEach(c => {
            str = `${str}\n${this.GetEntityTreeStringHelper(c, depth + 1)}`
        });
        return str;
    }

    // Function returning a collection of all the entities within the game. Utilizes 'GetAllEntitiesHelper'.
    GetAllEntities(activeOnly: boolean = true): EntityBase[] {
        let entities: EntityBase[] = [];
        this._entities.forEach(entity => {
            if (!activeOnly || entity.Enabled) {
                entities.push(entity);
                if (entity.Children.length > 0)
                    entities.push(...this.GetAllEntitiesHelper<EntityBase>(entity, activeOnly));
            }
        });
        return entities;
    }

    GetEntitiesOfType<T extends EntityBase>(type:ClassType<T>, activeOnly: boolean = true): T[] {
        let entities: T[] = [];
        this._entities.forEach(entity => {
            if (!activeOnly || entity.Enabled) {
                if (entity instanceof type)
                    entities.push(entity as T);
                if (entity.Children.length > 0)
                    entities.push(...this.GetAllEntitiesHelper<T>(entity, activeOnly, type));
            }
        });
        return entities;
    }

    // Recursive helper function for obtaining children of a give parent entity.
    private GetAllEntitiesHelper<T extends EntityBase>(parent: EntityBase, activeOnly: boolean, type?: ClassType<T>): T[] {
        let children: EntityBase[] = [];
        parent.Children.forEach(child => {
            if (!activeOnly || child.Enabled) {
                if (!type || child instanceof type)
                    children.push(child);
                if (child.Children.length > 0)
                    children.push(...this.GetAllEntitiesHelper(child, activeOnly, type));
            }
        })
        return children as T[];
    }

    GetAllEntitiesWithGuardMethod(method: (entity: EntityBase) => boolean, activeOnly: boolean = true): EntityBase[] {
        let entities: EntityBase[] = [];
        this._entities.forEach(entity => {
            if (!activeOnly || entity.Enabled) {
                if (method(entity))
                    entities.push(entity);
                if (entity.Children.length > 0)
                    entities.push(...this.GetAllEntitiesWithGuardMethodHelper(entity, method, activeOnly));
            }
        });
        return entities;
    }

    // Recursive helper function for obtaining children of a give parent entity.
    private GetAllEntitiesWithGuardMethodHelper(parent: EntityBase, method: (entity: EntityBase) => boolean, activeOnly: boolean): EntityBase[] {
        let children: EntityBase[] = [];
        parent.Children.forEach(child => {
            if (!activeOnly || child.Enabled) {
                if (method(child))
                    children.push(child);
                if (child.Children.length > 0)
                    children.push(...this.GetAllEntitiesWithGuardMethodHelper(child, method, activeOnly));
            }
        })
        return children;
    }

    // Get components of a certain type from all the entities within the game.
    // Calls 'GetAllEntities' to obtain all the current entities, and passes that as a collection to 'GetAllComponentsOfTypeFromEntityCollection'
    GetAllComponentsOfType<T extends ComponentBase>(type: ClassType<T>, activeOnly: boolean = true): T[] {
        return this.GetAllComponentsOfTypeFromEntityCollection(type, this.GetAllEntities(activeOnly), activeOnly);
    }

    // Get components of a certain type from the given collection.
    GetAllComponentsOfTypeFromEntityCollection<T extends ComponentBase>(type: ClassType<T>, collection: EntityBase[], activeOnly: boolean = true): T[] {
        let returned: T[] = [];
        collection.forEach(e => returned.push(...e.GetComponentsOfType(type, activeOnly)));
        return returned;
    }

    Update(): void {
        const newFrameTime = new Date().getTime();
        this._updateDelta = Math.min((newFrameTime - this._oldUpdateTime) / 1000, this._minimumUpdateDelta);
        this._oldUpdateTime = newFrameTime;

        // Update gamepad state
        GamepadHandler.Update();

        // Set world relative mouse position
        this._mousePosition = Vec2Utils.Sum(Vec2Utils.RotatePoint(Input.MousePosition, -Camera.Transform.RotationRadian), Camera.Transform.Position);

        StateManager.StateUpdate(this._updateDelta);

        // Split entities into game and ui collections
        const allEntities = Game.GetAllEntities();
        const gameEntities: GameEntityBase[] = [];
        const uiEntities: UiEntityBase[] = [];

        allEntities.forEach(e => {
            if (e instanceof GameEntityBase) gameEntities.push(e);
            else if (e instanceof UiEntityBase) uiEntities.push(e);
        });

        // Collect scene draw data
        const sceneDDs = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveBase, gameEntities, true) as DrawDirectiveBase[];
        CollectSceneRendererData('scene', sceneDDs);

        // Collect UI draw data
        const uiDDs = Game.GetAllComponentsOfTypeFromEntityCollection(DrawDirectiveBase, uiEntities, true) as DrawDirectiveBase[];
        CollectSceneRendererData('ui', uiDDs, false);

        // Collect lighting data for scene (UI doesn't support lighting)
        const lights: number[] = [];
        Game.GetAllComponentsOfTypeFromEntityCollection(LightComponent, gameEntities, true).forEach((l: LightComponent) => {
            if (Camera.IsInView(l.Parent.WorldRelativeTransform.Position, l.BoundingRadius))
                lights.push(...l.WebglData);
        });
        Rendering.SetDrawData('lighting', lights)

        // Collect debug draw data if relevant
        if (this._debug) {
            const dd: number[][] = [];

            gameEntities.forEach(e => e.GetAllComponents(true).forEach(c => {
                if (IsDebugDrawable(c) && c.DebugDrawData)
                    dd.push(c.DebugDrawData);
            }));

            // Behold, a band aid fix to un-make camera related changes
            const camPos = Camera.Transform.Position;
            const camRad = -Camera.Transform.RotationRadian;
            uiEntities.forEach(e => e.GetAllComponents(true).forEach(c => {
                if (IsDebugDrawable(c)) {
                    const cdd = c.DebugDrawData;
                    if (cdd) {
                        for (let i = 0; i < cdd.length / 5; i++) {
                            cdd[i * 5] += camPos[0];
                            cdd[i * 5 + 1] += camPos[1];

                            if (camRad) {
                                const rotated = Vec2Utils.RotatePointAroundCenter([cdd[i * 5], cdd[i * 5 + 1]], camRad, camPos);
                                cdd[i * 5] = rotated[0];
                                cdd[i * 5 + 1] = rotated[1];
                            }
                        }
                        dd.push(cdd);
                    }
                }
            }));

            Rendering.SetDrawData('debug', dd);
        } else {
            Rendering.SetDrawData('debug', []);
        }

        Rendering.Render()

        if (this._debug) {
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

        requestAnimationFrame(this.Update.bind(this));
    }
}

const CollectSceneRendererData = (rendererName: string, collection: DrawDirectiveBase[], inViewOnly: boolean = true) => {
    const data: ISceneDrawData = { opaque: {}, translucent: [] };
    const depthList = new SortedLinkedList<DrawDirectiveBase>((dd1: DrawDirectiveBase, dd2: DrawDirectiveBase) => {
        if (dd1.Parent.WorldRelativeTransform.Depth + dd1.DepthOffset < dd2.Parent.WorldRelativeTransform.Depth + dd2.DepthOffset) return -1;
        if (dd1.Parent.WorldRelativeTransform.Depth + dd1.DepthOffset > dd2.Parent.WorldRelativeTransform.Depth + dd2.DepthOffset) return 1;
        return 0;
    });

    // Part 1 of dealing with negative depth
    let lowestDepth = Number.MAX_SAFE_INTEGER;

    // Collect draw data
    collection.forEach((dd: DrawDirectiveBase) => {
        // Skip directives outside of view
        const dTrans = dd.Parent.WorldRelativeTransform
        const depth = dTrans.Depth + dd.DepthOffset;

        if (dd.Opacity > 0 && (!inViewOnly || Camera.IsInView(dTrans.Position, dd.BoundingRadius))) {
            let indexOffset = 0;

            if (dd.IsTranslucent || dd.Opacity < 1) {
                depthList.Add(dd);
                if (depth < lowestDepth)
                    lowestDepth = depth;
            } else {
                if (data.opaque[dd.ImageId])
                    indexOffset = data.opaque[dd.ImageId].indexes[data.opaque[dd.ImageId].indexes.length - 1] + 1;
                else
                    data.opaque[dd.ImageId] = { attributes: [], indexes: [] };

                data.opaque[dd.ImageId].attributes.push(...dd.WebGlData.attributes);
                for (const ind of dd.WebGlData.indexes)
                    data.opaque[dd.ImageId].indexes.push(ind + indexOffset);
            }
        }
    });

    for (const dd of depthList) {
        let indexOffset = 0;

        // Part 2 of dealing with negative depth
        const d = dd.Parent.WorldRelativeTransform.Depth + dd.DepthOffset - lowestDepth;
        if (!data.translucent[d])
            data.translucent[d] = [];

        // I don't even care anymore :D
        if (data.translucent[d][dd.ImageId])
            indexOffset = data.translucent[d][dd.ImageId].indexes[data.translucent[d][dd.ImageId].indexes.length - 1] + 1;
        else
            data.translucent[d][dd.ImageId] = { attributes: [], indexes: [] }

        data.translucent[d][dd.ImageId].attributes.push(...dd.WebGlData.attributes);
        for (const ind of dd.WebGlData.indexes)
            data.translucent[d][dd.ImageId].indexes.push(ind + indexOffset);
    }

    // Part 3 of dealing with negative depth
    data.translucent = data.translucent.filter(i => i);

    Rendering.SetDrawData(rendererName, data)
}

export const Game: GameManager = new GameManager();