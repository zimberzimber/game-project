import { IGameState } from "./GameStateBase";
import { UiEntityBase } from "../Entities/EntityBase";
import { Game } from "../Workers/Game";
import { StateManager } from "../Workers/GameStateManager";
import { SoundSingleInstanceComponent } from "../Components/Sound/SoundSingleInstance";
import { DrawDirectiveStaticImage } from "../Components/Visual/DrawDirectiveStaticImage";
import { Vec2Utils } from "../Utility/Vec2";
import { Camera } from "../Workers/CameraManager";
import { IntroSplash } from "../Entities/Ui/Windows/IntroSplash";
import { HorizontalAlignment, VerticalAlignment } from "../Models/GenericInterfaces";

const fadeDuration = 0.75;
const stayDuration = 2.5;
const fadeChangePerSecond = 1 / fadeDuration;

export class GameStateIntro implements IGameState {
    private _music: SoundSingleInstanceComponent;
    private _black: DrawDirectiveStaticImage;
    private _splash: IntroSplash;
    private _time = 0;

    OnActivated(): void {
        this._time = 0;
        this._splash = new IntroSplash();

        const me = new UiEntityBase();
        this._music = new SoundSingleInstanceComponent(me, 'music_main', false);
        
        const blackEnt = new UiEntityBase();
        this._black = new DrawDirectiveStaticImage(blackEnt, 'color_black', Vec2Utils.SumS(Camera.Transform.Scale, 10));
        this._black.Alignment = { horizontal: HorizontalAlignment.Middle, vertical: VerticalAlignment.Middle };
        blackEnt.Transform.Depth = 10;

        this._music.FadeIn(4);
    }

    OnDeactivated(): void {
        Game.RemoveEntity(this._splash);
        Game.RemoveEntity(this._black.Parent);
        delete this._splash;
        delete this._black;
    }

    Update(delta: number): void {
        if (this._time <= fadeDuration)
            this._black.Opacity -= fadeChangePerSecond * delta;

        else if (this._time > fadeDuration + stayDuration * 2)
            StateManager.ChangeState('title', this._music);

        else if (this._time > fadeDuration + stayDuration)
            this._black.Opacity += fadeChangePerSecond * delta;

        this._time += delta;
    }
}
