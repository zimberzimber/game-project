import { Game } from "./Workers/Game";
import { InputHandler } from "./Workers/InputHandler";
import { ISpriteAtlas } from "./Bases/SpriteAtlas";
import { LocalSpriteAtlas } from "./Workers/SpriteAtlas";

export class _G {
    static FPS: number = 30;
    static InputHandler: InputHandler = new InputHandler()
    static Game: Game = new Game(document.getElementById("game-canvas"));
    static SpriteAtlas: ISpriteAtlas;
    static DrawPolygons: boolean = true;
    static EnableDebugControlls: boolean = false;
}

window.addEventListener('DOMContentLoaded', (event) => {
    _G.SpriteAtlas = new LocalSpriteAtlas();
    _G.SpriteAtlas.OnDomLoaded();
    _G.Game.OnDomLoaded();
});

declare global {
    interface Window {
        Freeze: any;
        SetFPS: any;
    }
}

window.Freeze = function (): void {
    _G.Game.paused = !_G.Game.paused;
};

window.SetFPS = function (fps: number): void {
    _G.FPS = fps;
}

// let entity = new EntityBase();
// entity.transform.position.Set(100, 100);
// entity.AddComponent(new CircleDrawDirective(entity, 30));
// _G.Game.AddEntity(entity)
