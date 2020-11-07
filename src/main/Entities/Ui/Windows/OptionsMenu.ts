import { SliderBasicEntity } from "../Composite/SliderBasic";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";
import { Settings } from "../../../Workers/SettingsManager";
import { UserSetting } from "../../../Models/IUserSettings";
import { Vec2 } from "../../../Models/Vectors";
import { WindowBaseEntity } from "../WindowBase";
import { TextButtonEntity } from "../Composite/Buttons";
import { KeyRemapMenuUi } from "./KeyRemapMenu";
import { WindowBackgroundEntity } from "../Composite/WindowBackground";

const cfg = {
    sliders: [
        { str: 'Master Volume: ', setting: UserSetting.MasterVolume },
        { str: 'Music Volume: ', setting: UserSetting.MusicVolume },
        { str: 'SFX Volume: ', setting: UserSetting.SfxVolume },
    ],
    sliderSpacing: 50,
    sliderXOffset: 300,
    sliderSize: [100, 33],
    fontSize: 20,

    windowSize: [420, 190],
    windowPadding: 20,
    windowSprite: 'window_simple',
}

export class OptionsMenuUi extends WindowBaseEntity {
    constructor() {
        super();
        new WindowBackgroundEntity(this, cfg.windowSize as Vec2, cfg.windowPadding, cfg.windowSprite);

        for (let i = 0; i < cfg.sliders.length; i++) {
            const str = cfg.sliders[i].str;
            const setting = cfg.sliders[i].setting;

            const dd = new DrawDirectiveText(this, cfg.fontSize, `${str}${Math.floor(Settings.GetSetting(setting) * 100)}`);
            dd.DrawOffset = [0, cfg.windowSize[1] - i * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
            dd.VerticalAlignment = VerticalAlignment.Middle;
            dd.HorizontalAlignment = HorizontalAlignment.Left;
            dd.DepthOffset = 1;

            const s = new SliderBasicEntity(this, cfg.sliderSize as Vec2, Settings.GetSetting(setting), [0, 1], 0.05);
            s.Transform.Position = [cfg.sliderXOffset, cfg.windowSize[1] - i * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
            s.Transform.Depth = 1;
            s.OnValueChanged = (o, n) => {
                dd.Text = `${str}${Math.floor(n * 100)}`;
                Settings.SetSetting(setting, Math.floor(n * 100) * 0.01);
            };
        }

        const keyBT = new TextButtonEntity(this, [170, 33], 'button_wide', 'Remap Keys', 20, { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Left }, { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle });
        keyBT.Transform.Position = [0, cfg.windowSize[1] - cfg.sliders.length * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
        keyBT.OnUnclick = (isInside: boolean) => {
            if (isInside) {
                const options = new KeyRemapMenuUi();
                options.OnClose = () => this.Enabled = true;
                this.Enabled = false;
            }
        };

        const closeBT = new TextButtonEntity(this, [170, 33], 'button_wide', 'Close', 20, { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Right }, { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle });
        closeBT.Transform.Position = [cfg.windowSize[0], cfg.windowSize[1] - cfg.sliders.length * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
        closeBT.OnUnclick = (isInside: boolean) => { if (isInside) this.CloseWindow(); };
    }
}