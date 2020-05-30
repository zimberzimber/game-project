import { EntityBase } from "./EntityBase";

export abstract class ComponentBase {
    protected _parent: EntityBase;
    get Parent(): EntityBase { return this._parent; }

    Enabled: boolean = true;

    constructor(parent: EntityBase) {
        this._parent = parent;
    }

    Update(): void { };

    Delete(): void {
        this._parent.RemoveComponent(this);
    }

    Unitialize(): void {
        delete this._parent;
    }
}