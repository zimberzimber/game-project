import { UiEntityBase } from "../EntityBase"
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { ClickboxComponent } from "../../Components/Interactable/Clickable";
import { Vec2 } from "../../Models/Vectors";
import { SoundSingleInstanceComponent } from "../../Components/Sound/SoundBase";

export class ButtonBasicEntity extends UiEntityBase {
    private dd: DrawDirectiveAnimatedImage;
    private clickable: ClickboxComponent;
    private soundHover: SoundSingleInstanceComponent;
    private soundClick: SoundSingleInstanceComponent;

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

    constructor(parent: UiEntityBase | void | null, size: Vec2, spriteName: string) {
        super(parent);

        this.soundHover = new SoundSingleInstanceComponent(this, 'button_hover');
        this.soundClick = new SoundSingleInstanceComponent(this, 'button_click');
        this.clickable = new ClickboxComponent(this, size);
        this.dd = new DrawDirectiveAnimatedImage(this, spriteName, size);
        this.dd.Frame = 'passive';

        this.AddComponent(this.dd);
        this.AddComponent(this.clickable);
        this.AddComponent(this.soundHover);
        this.AddComponent(this.soundClick);

        // Adding this so that the hover and click animations play even when they don't have any functionality
        this.OnClick = () => {};
        this.OnUnclick = () => {};
        this.HoverEvent = () => {};
    }
}