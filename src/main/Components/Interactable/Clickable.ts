import { ComponentBase } from "../ComponentBase";
import { EntityBase, UiEntityBase } from "../../Entities/EntityBase";
import { IMouseObserver, IMouseEvent, ButtonState } from "../../Models/InputModels";
import { Vec2 } from "../../Models/Vectors";
import { Input } from "../../Workers/InputHandler";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { Vec2Utils } from "../../Utility/Vec2";
import { IsPointInPolygon } from "../../Workers/CollisionChecker";
import { HorizontalAlignment, VerticalAlignment, IAlignmentContainer, IDebugDrawable } from "../../Models/GenericInterfaces";
import { MiscUtil } from "../../Utility/Misc";
import { ScalarUtil } from "../../Utility/Scalar";

abstract class ClickableBaseComponent extends ComponentBase implements IDebugDrawable {
    private _mouseObserver: IMouseObserver;
    private _transformObserver: ITransformObserver;

    protected _horizontalAlignment: HorizontalAlignment = HorizontalAlignment.Left;
    get HorizontalAlignment(): HorizontalAlignment { return this._horizontalAlignment; }
    set HorizontalAlignment(alignment: HorizontalAlignment) {
        this._horizontalAlignment = alignment;
        this.CalculateClickArea();
    }

    protected _verticalAlignment: VerticalAlignment = VerticalAlignment.Bottom;
    get VerticalAlignment(): VerticalAlignment { return this._verticalAlignment; }
    set VerticalAlignment(alignment: VerticalAlignment) {
        this._verticalAlignment = alignment;
        this.CalculateClickArea();
    }

    get Alignment(): IAlignmentContainer { return { horizontal: this._horizontalAlignment, vertical: this._verticalAlignment }; }
    set Alignment(alignment: IAlignmentContainer) {
        this._verticalAlignment = alignment.vertical;
        this._horizontalAlignment = alignment.horizontal;
        this.CalculateClickArea();
    }

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

    abstract get DebugDrawData(): number[] | null;

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

        this._transformObserver = { OnObservableNotified: (args: ITransformEventArgs): void => this.CalculateClickArea() };
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
        this.CalculateClickArea();
    }

    IsPointInButton(point: Vec2): boolean {
        return IsPointInPolygon(point, this._clickArea);
    }

    get DebugDrawData(): number[] {
        return [
            this._clickArea[0][0], this._clickArea[0][1], 1, 1, 1,
            this._clickArea[1][0], this._clickArea[1][1], 1, 1, 1,
            this._clickArea[2][0], this._clickArea[2][1], 1, 1, 1,
            this._clickArea[3][0], this._clickArea[3][1], 1, 1, 1,
        ]
    }

    protected CalculateClickArea(): void {
        const pos = this._parent.worldRelativeTransform.Position;
        const scale = this._parent.worldRelativeTransform.Scale;
        const rot = this._parent.worldRelativeTransform.RotationRadian;

        this._clickArea = MiscUtil.CreateAlignmentBasedBox(pos, this._verticalAlignment, this._horizontalAlignment, Vec2Utils.Mult(this._size, scale));

        if (rot)
            for (let i = 0; i < this._clickArea.length; i++)
                this._clickArea[i] = Vec2Utils.RotatePointAroundCenter(this._clickArea[i], rot, pos);
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

    get DebugDrawData(): number[] {
        const returned: number[] = [];
        this._clickArea.forEach((v: Vec2) => returned.push(v[0], v[1], 1, 1, 1));
        return returned;
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

    get DebugDrawData(): number[] {
        const returned: number[] = [];
        const pos = this._parent.worldRelativeTransform.Position;
        const radius = (this._parent.worldRelativeTransform.Scale[0] + this._parent.worldRelativeTransform.Scale[1]) * 0.5 * this._radius;

        for (let a = 0; a < 360; a += 10)
            returned.push(...Vec2Utils.RotatePointAroundCenter([radius, 0], ScalarUtil.ToRadian(a), pos), 1, 1, 1);

        return returned;
    }
}