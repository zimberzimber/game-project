import { UiEntityBase } from "../EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { Vec2Utils } from "../../Utility/Vec2";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";

export class WindowBasicEntity extends UiEntityBase {
    // private dd: DrawDirectiveAnimatedImage;
    // private clickable: ClickboxComponent;
    // private soundHover: SoundComponent;
    // private soundClick: SoundComponent;

    private _dds: DrawDirectiveStaticImage[][] = [];

    private _size: Vec2;
    get Size(): Vec2 { return Vec2Utils.Copy(this._size); }
    set Size(size: Vec2) {
        this._size = Vec2Utils.Copy(size);
        this.RecalculateDrawDirectives()
    }

    private _padding: number;
    get Padding(): number { return this._padding; }
    set Padding(padding: number) {
        this._padding = padding;
        this.RecalculateDrawDirectives()
    }

    constructor(parent: UiEntityBase | void | null, size: Vec2, padding: number, spriteName: string) {
        super(parent);

        this._padding = padding;
        this._size = Vec2Utils.Copy(size);

        for (let x = 0; x < 3; x++) {
            this._dds[x] = [];
            for (let y = 0; y < 3; y++) {
                const c = new DrawDirectiveStaticImage(this, `window_simple_${y}${x}`);
                c.Alignment = { vertical: VerticalAlignment.Bottom, horizontal: HorizontalAlignment.Left };
                this._dds[x][y] = c;
                this.AddComponent(c);
            }
        }
        this.RecalculateDrawDirectives();
    }

    private RecalculateDrawDirectives() {
        for (let x = 0; x < 3; x++) {
            // x == 0 -> -padding
            // x == 1 -> 0
            // x == 2 -> size
            const ox = !x ? -this._padding : (x == 1 ? 0 : this._size[0]);
            const sx = x == 1 ? this._size[0] : this._padding;

            for (let y = 0; y < 3; y++) {
                // y == 0 -> size
                // y == 1 -> 0
                // y == 2 -> -padding
                this._dds[x][y].DrawOffset = [ox, !y ? this._size[1] : (y == 1 ? 0 : -this._padding)];
                this._dds[x][y].Size = [sx, y == 1 ? this._size[1] : this._padding];
            }
        }
    }
}