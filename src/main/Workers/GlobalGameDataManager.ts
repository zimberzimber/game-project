import { IGlobalGameDataObserver, IGlobalGameDataEventArgs, GlobalDataFields } from "../Models/GlobalData";
import { Observable } from "../Models/Observable";
import { MiscUtil } from "../Utility/Misc";

class GlobalGameDataManager {
    private _observables: { [key in GlobalDataFields]: Observable<IGlobalGameDataObserver, IGlobalGameDataEventArgs> };
    private _values: { [key in GlobalDataFields]: { isRef?: boolean, value: any } };

    constructor() {
        // Pull data from db

        this._values = {
            [GlobalDataFields.Score]: { value: 0 },
            [GlobalDataFields.MaxHealth]: { value: 5 },
            [GlobalDataFields.Health]: { value: 3 },
            [GlobalDataFields.MaxEnergy]: { value: 5 },
            [GlobalDataFields.Energy]: { value: 3 },
            [GlobalDataFields.PlayerEntity]: { value: undefined, isRef: true },
        }

        //@ts-ignore
        this._observables = {};
        for (const key in GlobalDataFields) {
            this._observables[key] = new Observable<IGlobalGameDataObserver, IGlobalGameDataEventArgs>();
        }
    }

    GetValue(field: GlobalDataFields): any {
        if (this._values[field].isRef)
            return this._values[field].value;
        else
            return MiscUtil.DeepCopyObject(this._values[field].value);
    }

    SetValue(field: GlobalDataFields, value: any): void {
        const old = this._values[field].value;

        if (old !== value) {
            if (this._values[field].isRef) {
                this._values[field].value = value;
                this.Notify(field, { oldValue: old, newValue: value })
            } else {
                this._values[field].value = MiscUtil.DeepCopyObject(value);
                this.Notify(field, { oldValue: MiscUtil.DeepCopyObject(old), newValue: MiscUtil.DeepCopyObject(value) })
            }
        }
    }

    Subscribe(field: GlobalDataFields, observer: IGlobalGameDataObserver): void {
        this._observables[field].Subscribe(observer);
    }

    Unsubscribe(field: GlobalDataFields, observer: IGlobalGameDataObserver): void {
        this._observables[field].Unsubscribe(observer);
    }

    UnsubscribeAllFromField(field: GlobalDataFields): void {
        this._observables[field].UnsubscribeAll();
    }

    UnsubscribeAll(): void {
        for (const key in this._observables)
            this._observables[key].UnsubscribeAll();
    }

    private Notify(field: GlobalDataFields, args: IGlobalGameDataEventArgs): void {
        this._observables[field].Notify(args);
    }
}

export const GlobalGameData = new GlobalGameDataManager();