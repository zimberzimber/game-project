import { UiEntityBase } from "../../EntityBase";
import { TextButtonEntity } from "../Composite/Buttons";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";
import { DrawDirectiveScrollableTiledImage } from "../../../Components/Visual/DrawDirectiveTiledImage";
import { DrawDirectiveFullImage } from "../../../Components/Visual/DrawDirectiveFullImage";
import { StateManager } from "../../../Workers/GameStateManager";
import { Camera } from "../../../Workers/CameraManager";
import { OptionsMenuUi } from "./OptionsMenu";

export class TitleScreenUi extends UiEntityBase {
    constructor() {
        super()

        const bg = new DrawDirectiveScrollableTiledImage(this, 'water', [256, 256], Camera.Transform.Scale, [0, 10]);
        bg.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        bg.DepthOffset = -1;

        const startBT = new TextButtonEntity(this, [200, 33], 'button_wide', 'Start Game', 20);
        startBT.Transform.Position = [-125, 25];
        startBT.OnUnclick = (isInside: boolean) => { if (isInside) StateManager.ChangeState('game', 'lv_00'); };

        const optionsBT = new TextButtonEntity(this, [200, 33], 'button_wide', 'Options', 20);
        optionsBT.Transform.Position = [125, 25];

        const imagesContainer = new UiEntityBase(this);
        optionsBT.OnUnclick = (isInside: boolean) => {
            if (isInside) {
                const opt = new OptionsMenuUi();
                opt.Transform.Position = [-210, -80];
                opt.OnClose = () => {
                    imagesContainer.Enabled = true;
                    startBT.Enabled = true;
                    optionsBT.Enabled = true;
                }
                imagesContainer.Enabled = false;
                startBT.Enabled = false;
                optionsBT.Enabled = false;
            }
        };

        imagesContainer.Transform.Depth = 1;

        const ori = new DrawDirectiveFullImage(imagesContainer, 'splash_ori', [198 * 0.85, 132 * 0.85]);
        const ku = new DrawDirectiveFullImage(imagesContainer, 'splash_ku', [390 * 0.5, 307 * 0.5]);
        const title = new DrawDirectiveFullImage(imagesContainer, 'title', [588, 164]);

        ori.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }
        ku.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }
        title.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }

        ori.DrawOffset = [-50, -75];
        ku.DrawOffset = [0, -125];
        title.DrawOffset = [0, 150];
    }
}