import { EntityBase } from "../Entities/EntityBase";

export abstract class ComponentBase {
    protected _parent: EntityBase;
    get Parent(): EntityBase { return this._parent; }

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

    constructor(parent: EntityBase) {
        this._parent = parent;
    }

    OnEnabled(): void { };
    OnDisabled(): void { };
    Update(): void { };

    Delete(): void {
        this._parent.RemoveComponent(this);
    }

    Unitialize(): void {
        delete this._parent;
    }
}