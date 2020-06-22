import { ComponentBase } from "../Components/ComponentBase";
import { Transform, ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { Vec2 } from "../Models/Vectors";

export class EntityBase implements ITransformObserver {
    private static NextEntityId: number = 0;

    readonly entityId: number;
    readonly transform: Transform = new Transform();

    protected _parent: EntityBase | undefined;
    protected _children: EntityBase[] = [];
    protected _components: ComponentBase[] = [];

    worldRelativeTransform: Transform;

    get Parent(): EntityBase | undefined { return this._parent; }
    get Children(): EntityBase[] { return this._children; }

    constructor(parent: EntityBase | void | null, position: Vec2 = [0, 0], rotation: number = 0, scale: Vec2 = [1, 1]) {
        this._parent = parent || undefined;
        this.entityId = EntityBase.NextEntityId++;

        this.transform.Position = position;
        this.transform.Rotation = rotation;
        this.transform.Scale = scale;
        this.transform.Subscribe(this);
        EntityBase.CalculateWorlRelativeTransform(this);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        EntityBase.CalculateWorlRelativeTransform(this);
    }

    Update(): void {
        this._components.forEach(c => c.Update());
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

    // Method for calculating an entities world relative transform, which is based on its parent chain
    // Also responsible for doing the same for all children entities 
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

        entity.worldRelativeTransform = relative;
        entity._children.forEach(c => EntityBase.CalculateWorlRelativeTransform(c));
    }
}
