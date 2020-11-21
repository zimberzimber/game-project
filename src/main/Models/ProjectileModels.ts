import { HitboxType, TriggerState, CollisionGroup } from "./CollisionModels";
import { Vec2 } from "./Vectors";

export interface IProjectileConfig {
    speed: number;
    lifeSpan: number;
    hitboxType: HitboxType;
    hitboxSize: number | Vec2 | Vec2[];
    triggerState: TriggerState;

    sprite?: string;
    spriteSize?: number | Vec2;
    particle?: string;
    damage?: number;
}

export interface IProjectileCollisionConfig {
    collisionGroup: CollisionGroup;
    collideWith: CollisionGroup;
}