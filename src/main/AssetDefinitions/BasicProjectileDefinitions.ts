import { CollisionGroup, HitboxType, TriggerState } from "../Models/CollisionModels"
import { IProjectileCollisionConfig, IProjectileConfig } from "../Models/ProjectileModels"

export const ProjectileCollisionDictionary: { [key: string]: IProjectileCollisionConfig } = {
    player_projectile : {
        collisionGroup: CollisionGroup.Projectile,
        collideWith: CollisionGroup.Enemy
    },
    
    enemy_projectile : {
        collisionGroup: CollisionGroup.Projectile,
        collideWith: CollisionGroup.Player
    }
}

export const ProjectileDictionary: { [key: string]: IProjectileConfig } = {
    ori_arrow: {
        speed: 600,
        lifeSpan: 10,
        hitboxType: HitboxType.Rectangular,
        hitboxSize: [50, 10],
        triggerState: TriggerState.OneTimeTrigger,

        sprite: "ori_arrow",
        spriteSize: [50, 50],
        particle: "ori_arrow_trail",
        damage: 1
    },

    spider_spit: {
        speed: 300,
        lifeSpan: 10,
        hitboxType: HitboxType.Circular,
        hitboxSize: 10,
        triggerState: TriggerState.OneTimeTrigger,

        sprite: "pentagon_purple",
        spriteSize: [15, 15],
        particle: "spider_spit_trails",
        damage: 1
    },

    basic_seeker: {
        speed: 500,
        lifeSpan: 10,
        hitboxType: HitboxType.Circular,
        hitboxSize: 20,
        triggerState: TriggerState.OneTimeTrigger,

        particle: "missile_fire",
        damage: 1
    }
}