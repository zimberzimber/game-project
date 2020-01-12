import { DrawLayer } from "./DrawLayer";

export class ToDrawLayerContainer {
    maxLayers: number = 0;

    constructor() {
        for (let member in DrawLayer) {
            const asNum = parseInt(member);
            if (asNum >= 0) {
                this.maxLayers = asNum > this.maxLayers ? asNum : this.maxLayers
                this[member] = [];
            }
        }
    }

    DrawAll(context: any): void {
        for (let layer = 0; layer < this.maxLayers; layer++) {
            this[layer].map(dd => dd.Draw(context));
        }
    }
}