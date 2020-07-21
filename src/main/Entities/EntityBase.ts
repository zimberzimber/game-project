import { ComponentBase } from "../Components/ComponentBase";
import { Transform, ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { Game } from "../Workers/Game";

export abstract class EntityBase implements ITransformObserver {
    private static NextEntityId: number = 0;

    readonly entityId: number;
    readonly transform: Transform = new Transform();
    readonly worldRelativeTransform: Transform = new Transform();

    protected _parent: EntityBase | undefined;
    protected _children: EntityBase[] = [];
    protected _components: ComponentBase[] = [];

    get Parent(): EntityBase | undefined { return this._parent; }
    get Children(): EntityBase[] { return this._children; }

    constructor(parent: EntityBase | void | null) {
        this._parent = parent || undefined;
        this.entityId = EntityBase.NextEntityId++;

        this.transform.Subscribe(this);
        EntityBase.CalculateWorlRelativeTransform(this);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        EntityBase.CalculateWorlRelativeTransform(this);
        this._children.forEach(c => c.OnObservableNotified(args));
    }

    Update(delta: number): void {
        this._components.forEach(c => c.Update(delta));
    }

    AddComponent(component: ComponentBase): void {
        this._components.push(component);
    }

    RemoveComponent(component: ComponentBase): void {
        this._components = this._components.filter(c => {
            if (c === component) {
                c.Unitialize();
                return false;
            }
            return true;
        });
    }

    RemoveAllComponents(): void {
        this._components.forEach(c => c.Unitialize());
        this._components = [];
    }

    GetComponentsOfType(type: any, activeOnly: boolean = false): ComponentBase[] {
        if (activeOnly)
            return this._components.filter(c => c.Enabled && c instanceof type);
        else
            return this._components.filter(c => c instanceof type);
    }

    AddChildEntity(child: EntityBase): void {
        if (child._parent)
            child._parent.RemoveChildEntity(child);
        child._parent = this;
        this._children.push(child);
    }

    RemoveChildEntity(child: EntityBase): void {
        this._children = this._children.filter(c => {
            if (c === child) {
                c._parent = undefined;
                return false;
            }
            return true;
        });
    }

    RemoveAllChildEntities(): void {
        this._children.forEach(c => {
            delete c._parent;
            c.Delete();
        });
    }

    Delete(): void {
        if (Game.IsRootEntity(this)) {
            // Reroute the deletion process to Game. This is terrible.
            Game.RemoveEntity(this);
            return;
        } else if (this._parent) {
            this._parent.RemoveChildEntity(this);
            delete this._parent;
        }

        this.transform.UnsubscribeAll();
        this.worldRelativeTransform.UnsubscribeAll();
        this.RemoveAllComponents();
        this.RemoveAllChildEntities();
    }

    // Method for calculating an entities world relative transform, which is based on its parent chain
    private static CalculateWorlRelativeTransform(entity: EntityBase): void {
        let relative: Transform;

        if (entity._parent == undefined)
            relative = Transform.Copy(entity.transform);
        else {
            relative = entity.transform;
            let current: EntityBase | undefined = entity._parent;
            while (current) {
                relative = Transform.TranformByTransform(relative, current.transform);
                current = current.Parent;
            }
        }

        // Changing the original transform instead of overriding it to retain observers and prevent memory leaks
        entity.worldRelativeTransform.SetTransformParams(relative.Position, relative.Rotation, relative.Scale, relative.Depth);
    }
}

export class UiEntityBase extends EntityBase {
    protected _parent: UiEntityBase | undefined;
    protected _children: UiEntityBase[] = [];

    get Parent(): UiEntityBase | undefined { return this._parent; }
    get Children(): UiEntityBase[] { return this._children; }

    constructor(parent: UiEntityBase | void | null) {
        super(parent);
    }
}

export class GameEntityBase extends EntityBase {
    protected _parent: GameEntityBase | undefined;
    protected _children: GameEntityBase[] = [];

    get Parent(): GameEntityBase | undefined { return this._parent; }
    get Children(): GameEntityBase[] { return this._children; }

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
    }
}