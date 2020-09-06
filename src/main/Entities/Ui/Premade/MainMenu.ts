import { UiEntityBase } from "../../EntityBase";
import { ButtonBasicEntity } from "../ButtonBasic";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";
import { DrawDirectiveScrollableTiledImage } from "../../../Components/Visual/DrawDirectiveTiledImage";
import { DrawDirectiveFullImage } from "../../../Components/Visual/DrawDirectiveFullImage";
import { StateManager } from "../../../Workers/GameStateManager";
import { Camera } from "../../../Workers/CameraManager";

export class TitleScreenUi extends UiEntityBase {
    constructor() {
        super()

        const bg = new DrawDirectiveScrollableTiledImage(this, 'water', [256, 256], Camera.Transform.Scale, [0, 10]);
        bg.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        bg.DepthOffset = -2;
        this.AddComponent(bg);

        const b1 = new ButtonBasicEntity(this, [100, 33], 'button_wide');
        this.AddChildEntity(b1);
        b1.OnUnclick = (isInside: boolean) => { if (isInside) StateManager.ChangeState('game'); };

        const text = new DrawDirectiveText(b1, 20, 'Start Game');
        text.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        text.DepthOffset = 1;
        b1.AddComponent(text);

        const e = new UiEntityBase(this);
        this.AddChildEntity(e);
        e.transform.Depth = 2;

        const ori = new DrawDirectiveFullImage(e, 'splash_ori', [198 * 0.85, 132 * 0.85]);
        const ku = new DrawDirectiveFullImage(e, 'splash_ku', [390 * 0.5, 307 * 0.5]);
        const title = new DrawDirectiveFullImage(e, 'title', [588, 164]);

        ori.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }
        ku.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }
        title.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }

        ori.DrawOffset = [-50, -75];
        ku.DrawOffset = [0, -125];
        title.DrawOffset = [0, 150];

        e.AddComponent(ori);
        e.AddComponent(ku);
        e.AddComponent(title);
    }
}