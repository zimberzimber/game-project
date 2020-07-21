import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { IMouseObserver, IMouseEvent, ButtonState } from "../../Models/InputModels";
import { Vec2 } from "../../Models/Vectors";
import { Input } from "../../Workers/InputHandler";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { Vec2Utils } from "../../Utility/Vec2";
import { IsPointInPolygon } from "../../Workers/CollisionChecker";

abstract class ClickableBaseComponent extends ComponentBase {
    private _mouseObserver: IMouseObserver;
    private _transformObserver: ITransformObserver;

    private ClickCallback: () => void;
    set OnClickCallback(callback: () => void) { this.ClickCallback = callback; }

    private UnclickCallback: (isInside: boolean) => void;
    set OnUnclickCallback(callback: (isInside: boolean) => void) { this.UnclickCallback = callback; }

    private HoverCallback: (hovered: boolean) => void;
    set HoverEventCallback(callback: (hovered: boolean) => void) { this.HoverCallback = callback; }

    protected _hovered: boolean = false;
    get IsHovered(): boolean { return this._hovered; }

    protected _down: boolean = false;
    get IsDown(): boolean { return this._down; }

    constructor(parent: EntityBase) {
        super(parent);

        this._mouseObserver = {
            // this._hovered already takes care of finding out whether the cursor is inside the clickbox or not
            OnObservableNotified: (args: IMouseEvent): void => {
                if (args.button == 0) {
                    if (this._down) {
                        if (args.state == ButtonState.Up) {
                            this._down = false;
                            if (this.UnclickCallback)
                                this.UnclickCallback(this._hovered);
                        }
                    } else {
                        if (args.state == ButtonState.Down && this._hovered) {
                            this._down = true;
                            if (this.ClickCallback)
                                this.ClickCallback();
                        }
                    }
                }
            }
        }
        Input.MouseObservable.Subscribe(this._mouseObserver);

        this._transformObserver = {
            OnObservableNotified: (args: ITransformEventArgs): void => this.CalculateClickArea()
        }
        this._parent.worldRelativeTransform.Subscribe(this._transformObserver);
    }

    Update(delta: number): void {
        super.Update(delta);

        // Call the hover callback when the cursor is inside the clickbox and it wasn't marked as hovered
        // Or when the cursor is not inside the clickbox but it is marked as hovered
        if (this.IsPointInButton(Input.MousePosition)) {
            if (!this._hovered) {
                this._hovered = true;
                if (this.HoverCallback)
                    this.HoverCallback(true);
            }
        } else if (this._hovered) {
            this._hovered = false;
            if (this.HoverCallback)
                this.HoverCallback(false);
        }
    }

    Unitialize(): void {
        Input.MouseObservable.Unsubscribe(this._mouseObserver);
        this._parent.worldRelativeTransform.Unsubscribe(this._transformObserver);
        super.Unitialize();
    }

    protected abstract CalculateClickArea(): void;
    abstract IsPointInButton(point: Vec2): boolean;
}

export class ClickboxComponent extends ClickableBaseComponent {
    protected _clickArea: Vec2[];

    private _size: Vec2;
    get Size(): Vec2 { return Vec2Utils.Copy(this._size); }
    set Size(size: Vec2) {
        this._size = Vec2Utils.Copy(size);
        this.CalculateClickArea();
    }

    constructor(parent: EntityBase, size: Vec2) {
        super(parent);
        this.Size = size;
    }

    IsPointInButton(point: Vec2): boolean {
        return IsPointInPolygon(point, this._clickArea);
    }

    protected CalculateClickArea(): void {
        const trans = this._parent.worldRelativeTransform;
        this._clickArea = [
            [trans.Position[0] + this._size[0] / 2 * trans.Scale[0], trans.Position[1] + this._size[1] / 2 * trans.Scale[1]],
            [trans.Position[0] - this._size[0] / 2 * trans.Scale[0], trans.Position[1] + this._size[1] / 2 * trans.Scale[1]],
            [trans.Position[0] - this._size[0] / 2 * trans.Scale[0], trans.Position[1] - this._size[1] / 2 * trans.Scale[1]],
            [trans.Position[0] + this._size[0] / 2 * trans.Scale[0], trans.Position[1] - this._size[1] / 2 * trans.Scale[1]]
        ];

        if (trans.Rotation != 0)
            for (let i = 0; i < this._clickArea.length; i++)
                this._clickArea[i] = Vec2Utils.RotatePointAroundCenter(this._clickArea[i], trans.RotationRadian, trans.Position);
    }
}

export class ClickPolygonComponent extends ClickableBaseComponent {
    protected _clickArea: Vec2[];

    protected _polygon: Vec2[];
    set ClickPolygon(polyline: Vec2[]) {
        this._polygon = [];
        for (const p of polyline)
            this._polygon.push(Vec2Utils.Copy(p));

        this.CalculateClickArea();
    }

    constructor(parent: EntityBase, clickPolygon: Vec2[]) {
        super(parent);
        this.ClickPolygon = clickPolygon;
    }

    IsPointInButton(point: Vec2): boolean {
        return IsPointInPolygon(point, this._clickArea);
    }

    protected CalculateClickArea(): void {
        const trans = this._parent.worldRelativeTransform;
        this._clickArea = [];

        if (trans.Rotation != 0) {
            for (const p of this._polygon)
                this._clickArea.push(Vec2Utils.Sum(Vec2Utils.Mult(p, trans.Scale), trans.Position));
        } else {
            for (const p of this._polygon)
                this._clickArea.push(Vec2Utils.Sum(Vec2Utils.RotatePointAroundCenter(Vec2Utils.Mult(p, trans.Scale), trans.RotationRadian, trans.Position), trans.Position));
        }
    }
}

export class ClickCircleComponent extends ClickableBaseComponent {
    private _clickRadius: number;

    private _radius: number;
    get Radius(): number { return this._radius; }
    set Radius(radius: number) {
        this._radius = radius;
        this.CalculateClickArea();
    }

    constructor(parent: EntityBase, radius: number) {
        super(parent);
        this.Radius = radius;
    }

    IsPointInButton(point: Vec2): boolean {
        return Vec2Utils.Distance(point, this._parent.worldRelativeTransform.Position) <= this._clickRadius;
    }

    protected CalculateClickArea(): void {
        this._clickRadius = this._radius * Math.max(this._parent.worldRelativeTransform.Scale[0], this._parent.worldRelativeTransform.Scale[1]);
    }
}