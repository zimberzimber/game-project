import { BaseKeyPreset, IKeyPressObserver } from "../Bases/BaseKeyPreset";
import { WasdKeyPreset } from "../Models/InputPresets";
import { KeyNames } from "../Models/InputHelpers";
import Vec2Utils from "../Utility/Vec2";
import Vec2 from "../Models/Vec2";
import Game from "../Workers/Game";

// Have to relay key presses through this class since holding a key down repeats the keydown event
class InputHandler implements IKeyPressObserver {
    keyPreset: BaseKeyPreset;

    constructor() {
        this.SetKeyPreset(new WasdKeyPreset());
    }

    SetKeyPreset(keyPreset: BaseKeyPreset) {
        if (this.keyPreset)
            this.keyPreset.Unsubscribe(this);

        this.keyPreset = keyPreset;
        window.onkeydown = keyPreset.ParseKeyDown.bind(keyPreset);
        window.onkeyup = keyPreset.ParseKeyUp.bind(keyPreset);
        keyPreset.Subscribe(this);
    }

    GetNormalizedMovementVector(): Vec2 {
        const delta: Vec2 = [0, 0];

        if (this.keyPreset.keysDown[KeyNames.up]) delta[1]++;
        if (this.keyPreset.keysDown[KeyNames.down]) delta[1]--;
        if (this.keyPreset.keysDown[KeyNames.right]) delta[0]++;
        if (this.keyPreset.keysDown[KeyNames.left]) delta[0]--;

        return Vec2Utils.Normalize(delta);
    }

    OnKeyDown(key: KeyNames): void {
        if (key == KeyNames.pause) {
            Game.SetPauseState(!Game.IsPaused());
        }
    }

    OnKeyUp(key: KeyNames): void {
    }
}

const inputHandler = new InputHandler();
export default inputHandler;