import { UiEntityBase } from "../../EntityBase";
import { Vec2 } from "../../../Models/Vectors";
import { ButtonBasicEntity } from "../ButtonBasic";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";
import { DrawDirectiveScrollableTiledImage } from "../../../Components/Visual/DrawDirectiveTiledImage";
import { SoundSingleInstanceComponent } from "../../../Components/Sound/SoundBase";
import { Light } from "../../../Components/Visual/Light";
import { DrawDirectiveFullImage } from "../../../Components/Visual/DrawDirectiveFullImage";

export class TitleScreenUi extends UiEntityBase {
    music: SoundSingleInstanceComponent;

    constructor(parent: UiEntityBase | void | null, size: Vec2) {
        super(parent)
        // this.transform.Position = [size[0] / -2, size[1] / -2];

        this.AddComponent(new DrawDirectiveScrollableTiledImage(this, 'water', [256, 256], [128, 128], [0, 10]));

        const e1 = new UiEntityBase(this);
        e1.transform.Depth = -1;
        e1.transform.Position = [75, 25];
        e1.AddChildEntity(new ButtonBasicEntity(e1, [150, 50], 'button_wide'));
        e1.AddComponent(new DrawDirectiveFullImage(e1, 'title', [50, 150]));
        this.AddChildEntity(e1);

        const e2 = new UiEntityBase(this);
        e2.transform.Depth = 1;
        e2.transform.Position = [75, -25];
        e2.AddChildEntity(new ButtonBasicEntity(e2, [150, 50], 'button_wide'));
        e1.AddComponent(new DrawDirectiveFullImage(e1, 'title', [50, 150]));
        this.AddChildEntity(e2);


        // const bg = new DrawDirectiveScrollableTiledImage(this, 'water', [256, 256], [128, 128], [0, 10]);
        // this.AddComponent(bg);
        // bg.HorizontalAlignment = HorizontalAlignment.Left;

        // const b1 = new ButtonBasicEntity(this, [100, 33], 'button_wide');
        // this.AddChildEntity(b1);
        // b1.OnClick = () => console.log('badabing');
        // b1.OnUnclick = (isInside: boolean) => console.log(`Badaboom in: ${isInside}`);
        // b1.HoverEvent = (hovered: boolean) => console.log(`Hovered: ${hovered}`);

        // // const text = new DrawDirectiveText(b1, 20, 'Start Game');
        // // text.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        // // b1.AddComponent(text);

        // this.music = new SoundSingleInstanceComponent(this, 'loop');
        // this.AddComponent(this.music);
        // this.music.Play();

        // const light = new Light(this, [1, 1, 1], 1000, 1);
        // this.AddComponent(light);

        // const e = new UiEntityBase(this);
        // this.AddChildEntity(e);
        // e.transform.Depth = 2;

        // const ori = new DrawDirectiveFullImage(e, 'splash_ori', [198 * 0.85, 132 * 0.85]);
        // const ku = new DrawDirectiveFullImage(e, 'splash_ku', [390 * 0.5, 307 * 0.5]);
        // const title = new DrawDirectiveFullImage(e, 'title', [588, 164]);
        // ori.DrawOffset = [-50, -75];
        // ku.DrawOffset = [0, -125];
        // title.DrawOffset = [0, 150];
        // e.AddComponent(ori);
        // e.AddComponent(ku);
        // e.AddComponent(title);
    }

    Delete() {
        this.music.Stop();
        super.Delete();
    }
}