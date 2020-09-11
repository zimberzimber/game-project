import { UiEntityBase } from "../../EntityBase";
import { Vec2 } from "../../../Models/Vectors";
import { Vec2Utils } from "../../../Utility/Vec2";
import { ScalarUtil } from "../../../Utility/Scalar";
import { ClickboxComponent } from "../../../Components/Interactable/Clickable";
import { Game } from "../../../Workers/Game";
import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";

interface ISliderValueChanged {
    (oldValue: number, newValue: number): void;
}

/** How far should a nub be away from the closest point to be before accounting for it */
const sliderMinNubToPointDistance = 0.05; // Mainly to reduce calculations and calls

export class SliderBasicEntity extends UiEntityBase {
    private _range: Vec2;
    get Range(): Vec2 { return Vec2Utils.Copy(this._range) };
    set Range(range: Vec2) {
        this._range = Vec2Utils.Copy(range);
        this.UpdatePcntIncrement();
        this.Value = this._value;
    }

    private _increment: number;
    get Increment(): number { return this._increment; }
    set Increment(increment: number) {
        this._increment = increment;
        this.UpdatePcntIncrement();
        this.Value = this._value;
    }

    private _value: number = Number.MIN_SAFE_INTEGER; // To make sure it gets updated.
    get Value(): number { return this._value; }
    set Value(value: number) {
        if (value === this._value) return;

        const newValue = ScalarUtil.ClampToIncrement(value, ScalarUtil.Clamp(this._range[0], this._increment, this._range[1]));
        if (newValue === this._value) return;

        const oldValue = this._value;
        this._value = newValue;
        this.UpdateNubPosition();

        if (this._valueChangedCallback)
            this._valueChangedCallback(oldValue, newValue);
    }

    private _size: Vec2;
    get Size(): Vec2 { return this._size; }

    private _pcntIncrement: number;
    private UpdatePcntIncrement(): void {
        this._pcntIncrement = this._increment / (Math.abs(this._range[0]) + Math.abs(this._range[1]));
    }

    private _valueChangedCallback: null | ISliderValueChanged;
    set OnValueChanged(callback: null | ISliderValueChanged) {
        this._valueChangedCallback = callback;
    }

    private _isDragging: boolean = false;
    private _clickable: ClickboxComponent;
    private _nubImage: DrawDirectiveStaticImage;
    private _bar: DrawDirectiveStaticImage;
    private _nubEntity: UiEntityBase;

    constructor(parent: UiEntityBase | void | null, size: Vec2, initialValue: number, range: Vec2, increment: number) {
        super(parent);

        this._size = Vec2Utils.Copy(size);
        this._range = Vec2Utils.Copy(range);
        this._increment = increment;
        this.UpdatePcntIncrement();

        this._bar = new DrawDirectiveStaticImage(this, 'slider_basic_bar', Vec2Utils.Copy(size));
        this._bar.VerticalAlignment = VerticalAlignment.Middle;
        this._bar.HorizontalAlignment = HorizontalAlignment.Left;

        this._nubEntity = new UiEntityBase(this);

        this._nubImage = new DrawDirectiveStaticImage(this._nubEntity, 'slider_basic_nub', [size[1], size[1]]);
        this._nubImage.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        this._clickable = new ClickboxComponent(this._nubEntity, [size[1], size[1]]);
        this._clickable.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this._clickable.OnClickCallback = this.ClickableDown.bind(this);
        this._clickable.OnUnclickCallback = this.ClickableUp.bind(this);
        this._clickable.HoverEventCallback = this.ClickableHover.bind(this);

        // Will update the nubs position accordingly as well
        this.Value = initialValue;
    }

    private ClickableDown(): void {
        this._isDragging = true;
    }
    private ClickableUp(): void {
        this._isDragging = false;
    }
    private ClickableHover(): void { }

    private UpdateNubPosition(): void {
        const pcnt = (this._value - this._range[0]) / (this._range[1] - this._range[0])
        this._nubEntity.Transform.Position = [this._size[0] * pcnt, this._nubEntity.Transform.Position[1]];
    }

    Update(delta: number): void {
        super.Update(delta);

        if (this._isDragging) {
            const pos = this.WorldRelativeTransform.Position;
            const mousePos = Game.MousePosition;

            const pcnt = ScalarUtil.Clamp(0, (mousePos[0] - pos[0]) / this._size[0], 1);
            const incClosest = ScalarUtil.ClampToIncrement(pcnt, this._pcntIncrement);

            if (Math.abs(incClosest - pcnt) < sliderMinNubToPointDistance) {
                this.Value = (this._range[1] - this._range[0]) * incClosest + this._range[0];
            }
        }
    }
}