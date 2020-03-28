export interface IDOMDependant {
    OnDomLoaded(): void;
}

export interface WebglData {
    vertexes: number[];
    indexes: number[];
}