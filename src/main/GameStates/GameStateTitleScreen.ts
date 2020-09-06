import { IGameState } from "./GameStateBase";
import { TitleScreenUi } from "../Entities/Ui/Premade/MainMenu";
import { Game } from "../Workers/Game";
import { SoundSingleInstanceComponent } from "../Components/Sound/SoundSingleInstance";
import { UiEntityBase } from "../Entities/EntityBase";
import { DrawDirectiveStaticImage } from "../Components/Visual/DrawDirectiveStaticImage";
import { Camera } from "../Workers/CameraManager";
import { Vec2Utils } from "../Utility/Vec2";
import { SliderBasicEntity } from "../Entities/Ui/SliderBasic";
import { OptionsMenuUi } from "../Entities/Ui/Premade/OptionsMenu";
import { VerticalAlignment, HorizontalAlignment } from "../Models/GenericInterfaces";

const fadeDuration = 2.5;
const fadeChangePerSecond = 1 / fadeDuration;

export class GameStateTitleScreen implements IGameState {
    private _main: TitleScreenUi;
    private _music: SoundSingleInstanceComponent;
    private _time = 0;
    private _black: DrawDirectiveStaticImage;

    OnActivated(args: any): void {
        if (args && args instanceof SoundSingleInstanceComponent) {
            this._music = args;
        } else {
            const me = new UiEntityBase();
            this._music = new SoundSingleInstanceComponent(me, 'music_main', false);
            me.AddComponent(this._music);
            this._music.FadeIn(2);
        }

        this._time = 0;
        this._main = new TitleScreenUi();
        this._main.transform.Depth = -10;

        const blackEnt = new UiEntityBase();
        this._black = new DrawDirectiveStaticImage(blackEnt, 'color_black', Vec2Utils.SumS(Camera.Transform.Scale, 10));
        this._black.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        blackEnt.transform.Depth = 30;
        blackEnt.AddComponent(this._black);

        const opt = new OptionsMenuUi();
        opt.transform.Position = [-250, -150];
        opt.transform.Depth = 10;

        Game.AddEntity(this._main);
        Game.AddEntity(opt);
        Game.AddEntity(blackEnt);
    }

    OnDeactivated(): void {
        this._music.FadeOut(2);
        Game.RemoveEntity(this._main);
        Game.RemoveEntity(this._music.Parent);
        Game.RemoveEntity(this._black.Parent);
        delete this._main;
        delete this._music;
        delete this._black;
    }

    Update(delta: number): void {
        if (this._time <= fadeDuration)
            this._black.Opacity -= fadeChangePerSecond * delta;

        // Update all entities
        Game.GetAllEntities().forEach(e => e.Update(delta));
        // this._main.Update(delta);
        this._time += delta;
    }
}