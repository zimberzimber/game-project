import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition, ISingleFrameSpriteStorage, IMultiFrameSpriteStorage } from "../Models/SpriteModels";
import { Log, LogLevel } from "./Logger";
import { OneTimeLog } from "./OneTimeLogger";
import { Images } from "./ImageManager";
import { Vec2Utils } from "../Utility/Vec2";


class SpriteManager {
    private sprites: { [key: string]: ISingleFrameSpriteStorage | IMultiFrameSpriteStorage } = {};
    private initialized: boolean = false;

    Initialize(spriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition }): void {
        if (this.initialized) {
            Log.Warn('Sprite Manager already initialized.');
            return;
        }

        this.initialized = true;
        for (const spriteName in spriteDefinitions) {

            // Get the images ID. Skip the sprite if its image doesn't exist
            let imageId = Images.GetImageIdFromName(spriteDefinitions[spriteName].sourceImageName);
            if (imageId == -1) {
                Log.Error(`Attempted to fetch nonexistent image named '${spriteDefinitions[spriteName].sourceImageName}' for sprite: ${spriteName}`);
                continue;
            }

            if (this.sprites[spriteName]) {
                Log.Error(`Sprite named '${spriteName}' was already defined.`);
                continue;
            }

            if ((spriteDefinitions[spriteName] as ISingleFrameSpriteDefinition).frame) {
                const def = spriteDefinitions[spriteName] as ISingleFrameSpriteDefinition;
                this.sprites[spriteName] = {
                    imageId: imageId,
                    isTranslucent: def.isTranslucent || false,
                    frame: def.frame
                }
                this.sprites[spriteName].metadata = def.metadata;

            } else if ((spriteDefinitions[spriteName] as IMultiFrameSpriteDefinition).frames) {
                const def = spriteDefinitions[spriteName] as IMultiFrameSpriteDefinition;

                const sprite: IMultiFrameSpriteStorage = {
                    imageId: imageId,
                    isTranslucent: def.isTranslucent || false,
                    frames: [],
                    names: def.names || undefined, // Adding an underfined in case of the definition having an empty array
                    aliases: def.aliases || undefined, // Adding an underfined in case of the definition having an empty array
                    metadata: def.metadata
                }

                sprite.frames = def.frames;
                this.sprites[spriteName] = sprite;

            } else { // Also covers empty frames array
                Log.Error(`Sprite definition for ${spriteName} lacks frame definitions. Ignoring.`)
                continue;
            }
        }
    }

    GetFullImageAsSprite(image: string): ISingleFrameSpriteStorage {
        const id = Images.GetImageIdFromName(image);
        if (id > -1)
            return { imageId: id, frame: { origin: [0, 0], size: Images.GetImageSize(id) }, isTranslucent: true }; // Always render them as translucent to prevent further complexity.

        OneTimeLog.Log(`nonexistentFullImage_${image}`, `Attempted to get non-existent image: ${image}`, LogLevel.Warn);
        return { imageId: 0, frame: { origin: [0, 0], size: [1, 1] }, isTranslucent: false };
    }

    GetStaticSpriteDataNoWarning(name: string): ISingleFrameSpriteStorage | null {
        if (this.sprites[name] && (this.sprites[name] as ISingleFrameSpriteStorage).frame)
            return this.sprites[name] as ISingleFrameSpriteStorage;
        return null;
    }

    GetStaticSpriteData(name: string): ISingleFrameSpriteStorage | null {
        const data = this.GetStaticSpriteDataNoWarning(name);

        if (data) return data;

        OneTimeLog.Log(`bad_static_sprite_${name}`, `Attempted to get a non-existent or non-static sprite: ${name}`, LogLevel.Warn);
        return null;
    }

    GetAnimatedSpriteDataNoWarning(name: string): IMultiFrameSpriteStorage | null {
        if (this.sprites[name] && (this.sprites[name] as IMultiFrameSpriteStorage).frames)
            return this.sprites[name] as IMultiFrameSpriteStorage;
        return null;
    }
    GetAnimatedSpriteData(name: string): IMultiFrameSpriteStorage | null {
        const data = this.GetAnimatedSpriteDataNoWarning(name);
        
        if (data) return data;

        OneTimeLog.Log(`bad_animated_sprite_${name}`, `Attempted to get a non-existent or non-animated sprite: ${name}`, LogLevel.Warn);
        return null;
    }
}

export const Sprites: SpriteManager = new SpriteManager();