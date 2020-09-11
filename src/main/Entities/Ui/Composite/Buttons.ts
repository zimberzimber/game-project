import { UiEntityBase } from "../../EntityBase"
import { DrawDirectiveAnimatedImage } from "../../../Components/Visual/DrawDirectiveAnimatedImage";
import { ClickboxComponent } from "../../../Components/Interactable/Clickable";
import { Vec2 } from "../../../Models/Vectors";
import { SoundSingleInstanceComponent } from "../../../Components/Sound/SoundSingleInstance";
import { VerticalAlignment, HorizontalAlignment, IAlignmentContainer } from "../../../Models/GenericInterfaces";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { UiUtility } from "../../../Utility/Ui";

export class ButtonBasicEntity extends UiEntityBase {
    protected dd: DrawDirectiveAnimatedImage;
    protected clickable: ClickboxComponent;
    protected soundHover: SoundSingleInstanceComponent;
    protected soundClick: SoundSingleInstanceComponent;

    protected _alignment: IAlignmentContainer = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Left };
    get Alignment(): IAlignmentContainer { return this._alignment }
    set Alignment(alignment: IAlignmentContainer) {
        this.dd.Alignment = alignment;
        this.clickable.Alignment = alignment;
        this._alignment = alignment;
    }

    get HorizontalAlignment(): HorizontalAlignment { return this._alignment.horizontal; }
    set HorizontalAlignment(alignment: HorizontalAlignment) { this.Alignment = { horizontal: alignment, vertical: this._alignment.vertical }; }

    get VerticalAlignment(): VerticalAlignment { return this._alignment.vertical; }
    set VerticalAlignment(alignment: VerticalAlignment) { this.Alignment = { horizontal: this._alignment.horizontal, vertical: alignment }; }

    set OnClick(event: () => void) {
        this.clickable.OnClickCallback = () => {
            this.dd.Frame = 'pressed';
            event();
        };
    }
    set OnUnclick(event: (isInside: boolean) => void) {
        this.clickable.OnUnclickCallback = (isInside: boolean) => {
            if (isInside) {
                this.dd.Frame = 'hovered';
                this.soundClick.Play();
                event(isInside);
            } else
                this.dd.Frame = 'passive';
        };
    }
    set HoverEvent(event: (hovered: boolean) => void) {
        this.clickable.HoverEventCallback = (hovered: boolean) => {
            if (this.clickable.IsDown && hovered) {
                this.dd.Frame = 'pressed';
                this.soundHover.Play();
            } else if (hovered) {
                this.dd.Frame = 'hovered';
                this.soundHover.Play();
            }
            else
                this.dd.Frame = 'passive';

            event(hovered);
        }
    }

    get Size(): Vec2 { return this.clickable.Size; }
    set Size(size: Vec2) {
        this.clickable.Size = size;
        this.dd.Size = size;
    }

    constructor(parent: UiEntityBase | void | null, size: Vec2, spriteName: string, alignment?: IAlignmentContainer) {
        super(parent);

        this.soundHover = new SoundSingleInstanceComponent(this, 'ui_button_hover', false);
        this.soundClick = new SoundSingleInstanceComponent(this, 'ui_button_click', false);

        this.clickable = new ClickboxComponent(this, size);
        this.dd = new DrawDirectiveAnimatedImage(this, spriteName, size);
        this.dd.Frame = 'passive';

        if (alignment)
            this.Alignment = alignment;
        else
            this.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        // Adding this so that the hover and click animations play even when they don't have any functionality
        this.OnClick = () => { };
        this.OnUnclick = () => { };
        this.HoverEvent = () => { };
    }
}

export class TextButtonEntity extends ButtonBasicEntity {
    protected _textDd: DrawDirectiveText;
    get Text(): any { return this._textDd.Text; }
    set Text(text: any) { this._textDd.Text = text; }

    protected _textAlignment: IAlignmentContainer = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Left };
    get TextAlignment(): IAlignmentContainer { return { horizontal: this._textAlignment.horizontal, vertical: this._textAlignment.vertical }; }
    set TextAlignment(alignment: IAlignmentContainer) {
        this._textDd.Alignment = alignment;
        this._textDd.DrawOffset = UiUtility.InnerElementAlignmentOffset(this._alignment, alignment, this.Size);
    }

    get HorizontalTextAlignment(): HorizontalAlignment { return this._textAlignment.horizontal; }
    set HorizontalTextAlignment(alignment: HorizontalAlignment) { this.TextAlignment = { horizontal: alignment, vertical: this._textAlignment.vertical }; }

    get VerticalTextAlignment(): VerticalAlignment { return this._textAlignment.vertical; }
    set VerticalTextAlignment(alignment: VerticalAlignment) { this.TextAlignment = { horizontal: this._textAlignment.horizontal, vertical: alignment }; }

    constructor(parent: UiEntityBase | void | null, size: Vec2, spriteName: string, text: any, fontSize: number, alignment?: IAlignmentContainer, textAlignment?: IAlignmentContainer) {
        super(parent, size, spriteName, alignment);

        this._textDd = new DrawDirectiveText(this, fontSize, text);
        this._textDd.DepthOffset = 1;
        if (textAlignment)
            this.TextAlignment = textAlignment;
        else
            this.TextAlignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
    }
}