import { ComponentBase } from "./ComponentBase";
import { Transform } from "../Models/Transform";

export class EntityBase {
    private static NextEntityId: number = 0;

    protected parent: EntityBase | undefined = undefined;
    protected children: EntityBase[] = [];
    protected components: ComponentBase[] = [];
    readonly transform: Transform = new Transform();
    readonly entityId: number;

    constructor(parent: EntityBase | void) {
        if (parent)
            this.parent = parent;

        this.entityId = EntityBase.NextEntityId;
        EntityBase.NextEntityId++;
    }

    GetParent(): EntityBase | undefined {
        return this.parent;
    }

    Update(): void {
        this.components.forEach(c => c.Update());
    }

    AddComponent(component: ComponentBase): void {
        this.components.push(component);
    }

    RemoveComponent(component: ComponentBase): void {
        this.components = this.components.filter(c => c !== component);
    }

    GetComponentsOfType(type: any): ComponentBase[] {
        return this.components.filter(c => c instanceof type);
    }

    GetChildren(): EntityBase[] {
        return this.children;
    }

    AddChildEntity(child: EntityBase): void {
        if (child.parent)
            child.parent.RemoveChild(child);
        child.parent = this;
        this.children.push(child);
    }

    RemoveChild(child: EntityBase): void {
        this.children = this.children.filter(c => c != child);
    }

    GetWorldRelativeTransform(): Transform {
        if (this.parent == undefined)
            return this.transform;

        let relative: Transform = this.transform;
        let current: EntityBase | undefined = this.parent;
        while (current) {
            relative = Transform.TranformByTransform(relative, current.transform);
            current = current.GetParent();
        }

        return relative;
    }
}
