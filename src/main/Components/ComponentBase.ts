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
        parent.AddComponent(this);
    }

    protected OnEnabled(): void { };
    protected OnDisabled(): void { };
    Update(delta: number): void { };

    Unitialize(): void {
        this.Enabled = false;
        for (const key in this) delete this[key];
    }

    toString(): string {
        return this.constructor.name;
    }

    get IsEnabledByHeirarchy(): boolean {
        return this._enabled ? this._parent.IsEnabledByHeirarchy : false;
    }
}