import { ComponentBase } from "./ComponentBase";
import { Transform } from "../Models/Transform";

export class EntityBase {
    components: ComponentBase[] = [];
    transform = new Transform();
    enabled: boolean = true;

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
}
