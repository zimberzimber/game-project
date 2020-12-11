import { ComponentBase } from "../Components/ComponentBase";
import { ClassType } from "../Models/GenericInterfaces";
import { Transform, ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { Game } from "../Workers/Game";
import { Log } from "../Workers/Logger";

export abstract class EntityBase implements ITransformObserver {
    readonly EntityId: number;
    readonly Transform: Transform = new Transform();
    readonly WorldRelativeTransform: Transform = new Transform();

    protected _parent: EntityBase | undefined;
    protected _children: EntityBase[] = [];
    protected _components: ComponentBase[] = [];

    get Parent(): EntityBase | undefined { return this._parent; }
    get Children(): EntityBase[] { return this._children; }

    private _enabled: boolean = true;
    get Enabled(): boolean { return this._enabled; }
    set Enabled(enable: boolean) {
        if (this._enabled != enable) {
            this._enabled = enable;
            if (enable)
                this.OnEnabled();
            else
                this.OnDisabled();
        }
    }

    constructor(parent: EntityBase | void | null) {
        this._parent = parent || undefined;
        this.EntityId = Game.NextEntityId;

        // Add the entity as a child to the parent, or to the entity tree root
        if (parent) parent.AddChildEntity(this);
        else Game.AddEntity(this);

        this.Transform.Subscribe(this);
        EntityBase.CalculateWorlRelativeTransform(this);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        EntityBase.CalculateWorlRelativeTransform(this);
        this._children.forEach(c => c.OnObservableNotified(args));
    }

    protected OnEnabled(): void { };
    protected OnDisabled(): void { };
    Update(delta: number): void {
        // Checking if enabled because this can still be reached udner certain circumstances
        // i.e an entity deleting/disabling a newer entity in its update method
        if (this.IsEnabledByHeirarchy) {
            this._children.forEach(c => { if (c.Enabled) c.Update(delta) });
            this._components.forEach(c => { if (c.Enabled) c.Update(delta) });
        }
    }

    AddComponent(component: ComponentBase): void {
        // Don't add the component if this entity is not its parent
        if (component.Parent !== this) {
            Log.Warn(`Component ${component.toString()} is child of ${this.toString()} entity.`);
            return;
        }

        // Don't add the component if its already present
        for (const c of this._components)
            if (c === component) {
                Log.Warn(`Component ${component.toString()} is already part of ${this.toString()} entity.`);
                return;
            }

        this._components.push(component);
    }

    RemoveComponent(component: ComponentBase): void {
        this._components = this._components.filter(c => {
            if (c === component) {
                c.Uninitialize();
                return false;
            }
            return true;
        });
    }

    RemoveAllComponents(): void {
        this._components.forEach(c => c.Uninitialize());
        this._components = [];
    }

    GetAllComponents(activeOnly: boolean = true): ComponentBase[] {
        if (!activeOnly)
            return Array.from(this._components);
        else
            return this._components.filter(c => c.Enabled);
    }

    GetComponentsOfType<T extends ComponentBase>(type: ClassType<T>, activeOnly: boolean = true): T[] {
        if (activeOnly)
            return this._components.filter(c => c.Enabled && c instanceof type) as T[];
        else
            return this._components.filter(c => c instanceof type) as T[];
    }

    AddChildEntity(child: EntityBase): void {
        // Don't add the entity if its already someones child, or a root entity
        if (child._parent !== this || Game.IsRootEntity(child)) {
            Log.Warn(`Failed adding entity ${child.toString()} as a child to entity ${this.toString()} as its either a child to another entity or a root entity.`);
            return;
        }

        // Don't add the entity if its already a child
        for (const c of this._children)
            if (c === child) {
                Log.Warn(`Entity ${child.toString()} is already a child of ${this.toString()}`);
                return;
            }

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

        this.Enabled = false;
        this.Transform.UnsubscribeAll();
        this.WorldRelativeTransform.UnsubscribeAll();
        this.RemoveAllComponents();
        this.RemoveAllChildEntities();

        for (const key in this) delete this[key];
    }

    // Method for calculating an entities world relative transform, which is based on its parent chain
    private static CalculateWorlRelativeTransform(entity: EntityBase): void {
        let relative: Transform;

        if (entity._parent == undefined)
            relative = Transform.Copy(entity.Transform);
        else {
            relative = entity.Transform;
            let current: EntityBase | undefined = entity._parent;
            while (current) {
                relative = Transform.TranformByTransform(relative, current.Transform);
                current = current.Parent;
            }
        }

        // Changing the original transform instead of overriding it to retain observers and prevent memory leaks
        entity.WorldRelativeTransform.SetTransformParams(relative.Position, relative.Rotation, relative.Scale, relative.Depth);
    }

    get IsEnabledByHeirarchy(): boolean {
        let e: EntityBase | undefined = this;
        do {
            if (!e._enabled) return false;
            e = e._parent;
        } while (e);

        return true;
    }

    toString = (): string => this.constructor.name;
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