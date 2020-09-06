import { UiEntityBase } from "../../EntityBase";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";

export class IntroSplash extends UiEntityBase {
    private _text: DrawDirectiveText;

    constructor(parent: UiEntityBase | void | null) {
        super(parent);

        this._text = new DrawDirectiveText(this, 20, 'Shits WIP yo\n<3');
        this.AddComponent(this._text);
    }
}