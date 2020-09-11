import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { VerticalAlignment, HorizontalAlignment, IAlignmentContainer } from "../../../Models/GenericInterfaces";
import { Settings } from "../../../Workers/SettingsManager";
import { UserSetting } from "../../../Models/IUserSettings";
import { Vec2 } from "../../../Models/Vectors";
import { WindowBaseEntity } from "../WindowBase";
import { ControlKey, IKeymap } from "../../../Models/ControlKeys";
import { Input } from "../../../Workers/InputHandler";
import { IKeyboardObserverFull } from "../../../Models/InputModels";
import { WindowBackgroundEntity } from "../Composite/WindowBackground";
import { TextButtonEntity } from "../Composite/Buttons";

const cfg = {
    fontSize: 20,

    windowSize: [250, 300],
    windowPadding: 20,
    windowSprite: 'window_simple',

    position: [-125, -150] as Vec2,
    buttonSize: [100, 25] as Vec2,
    verticalSpacing: 30,
    horizontalButtonOffset: 200,
    ButtonAlignment: { vertical: VerticalAlignment.Bottom, horizontal: HorizontalAlignment.Middle } as IAlignmentContainer,
    ButtonTextAlignment: { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle } as IAlignmentContainer,
    labelAlignment: { vertical: VerticalAlignment.Bottom, horizontal: HorizontalAlignment.Left } as IAlignmentContainer,
}

export class KeyRemapMenuUi extends WindowBaseEntity {
    private _keymap: IKeymap = Settings.GetSetting(UserSetting.ControlsKeymap);
    private _keyboardObserver: IKeyboardObserverFull | undefined;

    constructor() {
        super();
        new WindowBackgroundEntity(this, cfg.windowSize as Vec2, cfg.windowPadding, cfg.windowSprite);
        this.Transform.Position = cfg.position;

        let count = 0;
        for (let controlKey in ControlKey) {
            if (isNaN(Number(controlKey))) { // enum interation requirement
                const controlKeyText = new DrawDirectiveText(this, cfg.fontSize, controlKey);
                controlKeyText.DrawOffset = [0, cfg.windowSize[1] - cfg.verticalSpacing - count * cfg.verticalSpacing];
                controlKeyText.Alignment = cfg.labelAlignment;
                controlKeyText.DepthOffset = 1;

                //@ts-ignore TypeScript doesn't consider this as the enums type for some reason
                const enumKey: ControlKey = ControlKey[controlKey];

                const BT = new TextButtonEntity(this, cfg.buttonSize, 'button_wide', Input.GetCharcodeForKey(enumKey) || 'Unassigned', cfg.fontSize, cfg.ButtonAlignment, cfg.ButtonTextAlignment);
                BT.Transform.Position = [cfg.horizontalButtonOffset, cfg.windowSize[1] - cfg.verticalSpacing - count * cfg.verticalSpacing];

                BT.OnUnclick = (isInside: boolean) => {
                    if (isInside) {
                        if (this._keyboardObserver)
                            Input.KeyboardFullObservable.Unsubscribe(this._keyboardObserver);

                        this._keyboardObserver = {
                            OnObservableNotified: (args: KeyboardEvent): void => {
                                this._keymap[ControlKey[controlKey]] = args.code;
                                Settings.SetSetting(UserSetting.ControlsKeymap, this._keymap);

                                BT.Text = args.code;
                                Input.KeyboardFullObservable.Unsubscribe(this._keyboardObserver!);
                                delete this._keyboardObserver;
                            }
                        }
                        Input.KeyboardFullObservable.Subscribe(this._keyboardObserver);
                    }
                };

                count++;
            }
        }

        const closeBT = new TextButtonEntity(this, [100, 33], 'button_wide', 'Close', cfg.fontSize, { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle }, cfg.ButtonTextAlignment);
        closeBT.Transform.Position = [cfg.windowSize[0] * 0.5, 0];
        closeBT.OnUnclick = (isInside: boolean) => { if (isInside) this.CloseWindow() };
    }
}