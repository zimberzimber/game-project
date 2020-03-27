import { Game } from "./Workers/Game";
import { InputHandler } from "./Workers/InputHandler";
import SpriteAtlas from "./Workers/SpriteAtlas"

export class _G {
    static InputHandler: InputHandler = new InputHandler()
    static Game: Game = new Game();
    static SpriteAtlas = SpriteAtlas;
    static DebugDraw: boolean = true;
    static EnableDebugControlls: boolean = false;
}

window.onload = (e) => {
    _G.Game.OnDomLoaded();
};

declare global {
    interface Window {
        Freeze: any;
        SetFPS: any;
    }
}

window.Freeze = (): void => { _G.Game.paused = !_G.Game.paused; };


// let entity = new EntityBase();
// entity.transform.position.Set(100, 100);
// entity.AddComponent(new CircleDrawDirective(entity, 30));
// _G.Game.AddEntity(entity)
