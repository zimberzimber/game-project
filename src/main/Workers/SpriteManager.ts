import { ISprite } from "../Models/ISprite";

const staticAtlas: { [key: string]: ISprite } = Object.freeze({
    assetMissing: {
        coords: [0, 0],
        size: [0.125, 0.125],
        texture: 0
    },
    heart: {
        coords: [0.125, 0],
        size: [0.125, 0.125],
        texture: 0
    },
});

const animatedAtlas: { [key: string]: ISprite[] } = Object.freeze({
    dice: [
        {
            coords: [0, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
        {
            coords: [0.125, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
        {
            coords: [0.250, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
        {
            coords: [0.375, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
        {
            coords: [0.500, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
        {
            coords: [0.625, 0.125],
            size: [0.125, 0.125],
            texture: 0
        },
    ]
});

class SpriteManager {
    GetStaticSprite = (spriteName: string): ISprite => staticAtlas[spriteName] ? staticAtlas[spriteName] : staticAtlas.assetMissing;

    GetanimatedSpriteFrame = (name: string, frame: number): ISprite => {
        if (animatedAtlas[name] && animatedAtlas[name][frame])
            return animatedAtlas[name][frame];
        return staticAtlas.assetMissing;
    }
}

const atlas: SpriteManager = new SpriteManager();
export default atlas;

// import { ISpriteAtlas } from "../Bases/SpriteAtlas";
// import { ImageDrawDirectiveData } from "../Models/ImageDrawDirectiveData";

// export class LocalSpriteAtlas implements ISpriteAtlas {

//     private _imageElement: any;

//     constructor() { }

//     OnDomLoaded(): void {
//         this._imageElement = document.createElement("img");
//         this._imageElement.src = "sprites/atlas.png";
//         // document.body.appendChild(this._imageElement);
//     }

//     GetSprite(spriteName: string): any {
//         const d = new ImageDrawDirectiveData();

//         if (spriteName == "player") {
//             d.img = this._imageElement;
//             d.x = 16;
//             d.y = 0;
//             d.width = 16;
//             d.height = 16;
//         } else {
//             d.img = this._imageElement;
//             d.x = 0;
//             d.y = 0;
//             d.width = 16;
//             d.height = 16;
//         }

//         return d;
//     }
// }

// export class SpriteAtlass {
//     private static Atlas = [];
//     private static UnusedTime = 30000; // Time in ms until a sprite is considered unused, so the system knows when to unload it.

//     static GetSprite(name: string, frame: number = -1) {

//     }

//     static UnloadUnused() {

//     }

//     private static LoadSprite(): SpriteContainer {
//         return null;
//     }
// }

// export class SpriteContainer {
//     static pathPrefix = "./sprites/";

//     currentlyUsing: number;
//     lastUsed: Date;

//     name: string;
//     fullImage: any;
//     // framesConfig:FramesConfig;
//     frames: any[] = [];

//     constructor(name: string) {
//         this.name = name;
//         this.fullImage = new Image();
//         this.fullImage.src = `${SpriteContainer.pathPrefix}${name}.png`;
//     }

// }

// // Starbounds format is ****ing amazing, but its too heavy for my needs
// /*
// export class FramesConfig{
//     frameSize:Vec2;
//     frameCount:Vec2;
//     frameNames:any[][];
//     frameAliases:object;

//     constructor(path:string){
//         // Create a file reader class
//         // Send that class the path
//         // Get a JSON object back, and map the variables
//     }

//     example = {
//         "frameSize" : [1,1],
//         "frameCount" : [2,2],
//         "frameNames" : [
//             ["00", "01"],
//             ["10", "11"]
//         ],

//         "frameAliases" : {
//             "topleft" : "00",
//             "topright" : "01",
//             "bottomleft" : "10",
//             "bottomright" : "11",

//             "ten" : "10",
//             "eleven" : "11"
//         }
//     }
// }
// */


