import { UiEntityBase } from "../../EntityBase";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { HorizontalAlignment, VerticalAlignment } from "../../../Models/GenericInterfaces";

export class IntroSplash extends UiEntityBase {
    private _text: DrawDirectiveText;

    constructor(parent: UiEntityBase | void | null) {
        super(parent);

        this._text = new DrawDirectiveText(this, 20, 'Shits WIP yo\n<3');
        this._text.Alignment = { horizontal: HorizontalAlignment.Middle, vertical: VerticalAlignment.Middle };
    }
}