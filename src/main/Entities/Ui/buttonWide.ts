import { UiEntityBase } from "../EntityBase"
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { ClickboxComponent } from "../../Components/Interactable/Clickable";

export class ButtonWideEntity extends UiEntityBase {
    dd: DrawDirectiveAnimatedImage;
    clickable: ClickboxComponent;

    constructor(parent: UiEntityBase | void | null) {
        super(parent);

        this.dd = new DrawDirectiveAnimatedImage(this, 'button_wide', [99, 21]);
        this.dd.Frame = 'normal';
        this.clickable = new ClickboxComponent(this, [99, 21]);

        this.clickable.HoverEventCallback = (hovered: boolean) => console.log(`Hover - ${hovered}`);
        this.clickable.OnClickCallback = () => console.log('badabing');
        this.clickable.OnUnclickCallback = () => console.log('badaboom');

        this.AddComponent(this.dd);
        this.AddComponent(this.clickable);
    }
}