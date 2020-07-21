import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";

export class ResourceComponent extends ComponentBase {
    private _maxValue: number;
    get MaxValue(): number { return this._maxValue; }
    set MaxValue(max: number) {
        this._maxValue = Math.max(0, max);
        this.CurrentValue = Math.min(this._currentValue, max);
    }

    private _currentValue: number;
    get CurrentValue(): number { return this._currentValue; }
    set CurrentValue(value: number) {
        const delta = Math.max(0, Math.min(value, this._maxValue)) - this._currentValue;
        if (delta != 0) {
            this._currentValue += delta;

            if (this.ValueChanged)
                this.ValueChanged(delta);

            if (this._currentValue == 0 && this.Depleted)
                this.Depleted();

            if (this._currentValue == this._maxValue && this.Full)
                this.Full();
        }
    }

    private ValueChanged: (delta: number) => void;
    set ValueChangedCallback(callback: (delta: number) => void) {
        this.ValueChanged = callback;
    }

    private Depleted: () => void;
    set DepletedCallback(callback: () => void) {
        this.Depleted = callback;
    }

    private Full: () => void;
    set FullCallback(callback: () => void) {
        this.Full = callback;
    }

    constructor(parent: EntityBase, maxValue: number, startingValue: number) {
        super(parent);
        this.MaxValue = maxValue;
        this.CurrentValue = startingValue;
    }

    SetValueToPercent(percent: number) {
        percent = Math.max(0, Math.min(percent, 1));
        this.CurrentValue = this._maxValue * percent;
    }

    SetMaxKeepRelativeValue(max: number) {
        const percent = this._maxValue == 0 ? 0 : this._currentValue / this._maxValue;
        this._maxValue = max;
        this._currentValue = max * percent;
    }
}