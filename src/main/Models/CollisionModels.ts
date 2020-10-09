import { HitboxBase } from "../Components/Hitboxes/HitboxBase";

export enum TriggerState {
    NotTrigger,
    ContinuousTrigger,
    OnEnterTrigger,
    OneTimeTrigger
}

export enum HitboxType {
    Base,
    Rectangular,
    Circular,
    Polygonal
}

// Nifty flag making technique picked up from
// https://stackoverflow.com/questions/39359740/what-are-enum-flags-in-typescript
export enum CollisionGroup {
    None = 0,
    Projectile = 1 << 0,
    Hazard = 1 << 1,
    Player = 1 << 2,
    Enemy = 1 << 3,
    All = ~(~0 << 4)
}

export type CollisionDelegate = (trigerredBy: HitboxBase) => void;