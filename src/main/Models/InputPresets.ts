import { BaseKeyPreset } from "../Bases/BaseKeyPreset";
import { KeyDefs } from "./InputHelpers";

export class ClassicKeyPreset extends BaseKeyPreset {
    keyDefs: KeyDefs = {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        pause: 27,
        interact: 90,
        cancel: 88
    };
}

export class WasdKeyPreset extends BaseKeyPreset {
    keyDefs: KeyDefs = {
        up: 87,
        down: 83,
        left: 65,
        right: 68,
        pause: 80,
        interact: 69,
        cancel: 27
    };
}
