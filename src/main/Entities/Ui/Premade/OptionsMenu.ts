import { UiEntityBase } from "../../EntityBase";
import { SliderBasicEntity } from "../SliderBasic";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { VerticalAlignment, HorizontalAlignment } from "../../../Models/GenericInterfaces";
import { Settings } from "../../../Workers/SettingsManager";
import { UserSetting } from "../../../Models/IUserSettings";
import { Vec2 } from "../../../Models/Vectors";
import { WindowBasicEntity } from "../WindowBasic";
import { ButtonBasicEntity } from "../ButtonBasic";
import { Game } from "../../../Workers/Game";

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

    windowSize: [500, 300],
    windowPadding: 20,
    windowSprite: 'window_simple',
}

export class OptionsMenuUi extends WindowBasicEntity {
    constructor(parent: void | UiEntityBase | null) {
        super(parent, cfg.windowSize as Vec2, cfg.windowPadding, cfg.windowSprite);

        for (let i = 0; i < cfg.sliders.length; i++) {
            const str = cfg.sliders[i].str;
            const setting = cfg.sliders[i].setting;

            const dd = new DrawDirectiveText(this, cfg.fontSize, `${str}${Math.floor(Settings.GetSetting(setting) * 100)}`);
            dd.DrawOffset = [0, cfg.windowSize[1] - i * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
            dd.VerticalAlignment = VerticalAlignment.Middle;
            dd.HorizontalAlignment = HorizontalAlignment.Left;
            dd.DepthOffset = 1;
            this.AddComponent(dd);

            const s = new SliderBasicEntity(this, cfg.sliderSize as Vec2, Settings.GetSetting(setting), [0, 1], 0.05);
            s.transform.Position = [cfg.sliderXOffset, cfg.windowSize[1] - i * cfg.sliderSpacing - cfg.sliderSize[1] * 0.5];
            s.transform.Depth = 1;
            s.OnValueChanged = (o, n) => {
                dd.Text = `${str}${Math.floor(n * 100)}`;
                Settings.SetSetting(setting, Math.floor(n * 100) * 0.01);
            };
            this.AddChildEntity(s);
        }

        const t = new DrawDirectiveText(this, cfg.fontSize, 'TO DO: graphic + control settings');
        t.DepthOffset = 1;
        t.DrawOffset = [cfg.windowSize[0] * 0.5, 50];
        t.VerticalAlignment = VerticalAlignment.Bottom;
        t.HorizontalAlignment = HorizontalAlignment.Middle;
        this.AddComponent(t);

        const keyRemapButton = new ButtonBasicEntity(this, [100, 33], 'button_wide');
        keyRemapButton.transform.Position = [cfg.windowSize[0] * 0.25, 0];
        this.AddChildEntity(keyRemapButton);
        keyRemapButton.OnUnclick = (isInside: boolean) => { if (isInside) console.log('TO DO'); };

        const keyRemapText = new DrawDirectiveText(keyRemapButton, 20, 'Remap Keys');
        keyRemapText.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        keyRemapText.DepthOffset = 1;
        keyRemapButton.AddComponent(keyRemapText);

        const closeButton = new ButtonBasicEntity(this, [100, 33], 'button_wide');
        closeButton.transform.Position = [cfg.windowSize[0] * 0.5, 0];
        this.AddChildEntity(closeButton);
        closeButton.OnUnclick = (isInside: boolean) => { if (isInside) Game.RemoveEntity(this); };

        const closeText = new DrawDirectiveText(closeButton, 20, 'Close');
        closeText.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        closeText.DepthOffset = 1;
        closeButton.AddComponent(closeText);
    }
}