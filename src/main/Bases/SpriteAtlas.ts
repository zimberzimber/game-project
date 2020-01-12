import { IDOMDependant } from "./DOMDependant";
import { ImageDrawDirectiveData } from "../Models/ImageDrawDirectiveData";

export interface ISpriteAtlas extends IDOMDependant {
    GetSprite(spriteName: string): ImageDrawDirectiveData;
}