import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { MiscUtil } from "../../Utility/Misc";
import { ComponentBase } from "../ComponentBase";

export interface IPolylineMutatorDictionary extends Array<Vec2[]> { }

export class PolylineMutatorComponent extends ComponentBase {
    protected _dictionary: IPolylineMutatorDictionary;
    protected _loop: boolean;

    protected _polyline: Vec2[];
    get Polyline(): Vec2[] {
        return this._polyline;
    }

    protected _index: number;
    get Index(): number { return this._index; }
    set Index(index: number) {
        if (index >= 0 && index < this._dictionary.length) {
            this._index = index;
            this._polyline = MiscUtil.DeepCopyObject(this._dictionary[index]);

            if (this._mutatedCallback)
                this._mutatedCallback(this._polyline, index);
        }
    }

    protected _mutatedCallback: undefined | ((polyline: Vec2[], index: number) => void);
    set OnMutated(callback: null | ((polyline: Vec2[], index: number) => void)) {
        if (callback)
            this._mutatedCallback = callback;
        else
            delete this._mutatedCallback;
    }

    constructor(parent: EntityBase, polylineDictionary: IPolylineMutatorDictionary, allowLoop: boolean) {
        super(parent);
        this._dictionary = polylineDictionary;
        this._loop = allowLoop;
        this.Index = 0;
    }


    Next() {
        if (this._loop && this._index == this._dictionary.length - 1) {
            this.Index = 0;
        } else
            this.Index++;
    }

    Previous() {
        if (this._loop && this._index == 0) {
            this.Index = this._dictionary.length - 1;
        } else
            this.Index--;
    }
}

export class TimedPolylineMutatorComponent extends PolylineMutatorComponent {
    protected _interval: number
    protected _time: number = 0;

    protected _reverse: boolean;
    get IsReverseOrder(): boolean { return this._reverse; }
    set IsReverseOrder(isReversed: boolean) { this._reverse = isReversed; }

    constructor(parent: EntityBase, polylineDictionary: IPolylineMutatorDictionary, interval: number, loop: boolean, reversedOrder: boolean) {
        super(parent, polylineDictionary, loop);
        this._interval = interval;
        this._reverse = reversedOrder;
    }

    Update(delta: number) {
        super.Update(delta);

        this._time += delta;
        if (this._time >= this._interval) {
            this._reverse ? this.Previous() : this.Next();
            this._time -= this._interval;
        }
    }
}