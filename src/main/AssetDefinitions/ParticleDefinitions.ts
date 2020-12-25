import { IParticleDefinition } from "../Models/ParticleModels";

export const particleDefinitions: { [key: string]: IParticleDefinition } = {
    test: {
        spriteName: 'asset_missing',
        size: [5, 5],
        sizeMultiplier: [0.5, 2],
        initialRotation: [0, 360],

        emissionRate: 33,
        maxParticles: 999,
        lifeSpan: 5,

        spawnBox: [[-2.5, 15], [2.5, 15]],

        opacity: 1,
        fadeInTime: 2,
        // fadeOutStartTime: 4.5,

        // Movement
        emissionAngle: [0, 360],
        emissionForce: 300,
        forceResistence: 3,
        gravity: [0, 0],
        rotationSpeed: 20,
        relativePositioning: false,
        faceForceDirection: true,
        sizeGrowth: 1,
    },

    missile_fire: {
        spriteName: 'color_yellow',
        size: [5, 5],
        sizeMultiplier: [0.75, 2],
        initialRotation: [0, 360],

        emissionRate: 100,
        maxParticles: 300,
        lifeSpan: 1.5,

        spawnBox: [[-0.3, -0.2], [0.3, -1]],

        opacity: [0.8, 1],
        fadeInTime: 0.1,
        fadeOutStartTime: 0.2,

        // Movement
        relativePositioning: false,
        sizeGrowth: 1,
        rotationSpeed: 30
    },

    spider_spit_trails: {
        spriteName: 'pentagon_purple',
        size: [9, 9],
        sizeMultiplier: [0.75, 2],
        initialRotation: [0, 360],

        emissionRate: 100,
        maxParticles: 300,
        lifeSpan: 0.25,

        spawnBox: [[-0.1, -0.1], [0.1, 0.1]],
        fadeOutStartTime: 0.15,

        // Movement
        relativePositioning: false,
        sizeGrowth: -1,
        rotationSpeed: 30
    },

    spider_string_gib: {
        spriteName: 'spider_string_gib',
        size: [9, 9],
        sizeMultiplier: [0.75, 2],
        initialRotation: [0, 360],

        emissionRate: 0,
        maxParticles: 30,
        lifeSpan: 2,

        spawnBox: [[-2, 0], [2, 250]],
        fadeOutStartTime: 0.15,

        // Movement
        relativePositioning: false,
        sizeGrowth: -1,
        rotationSpeed: 30
    },

    ori_arrow_trail: {
        spriteName: 'flake_white',
        size: [18, 18],
        sizeMultiplier: [0.75, 1.25],

        emissionRate: 30,
        maxParticles: 100,
        lifeSpan: 0.5,

        spawnBox: [[-0.2, -3], [0, 3]],
        fadeOutStartTime: 0.15,

        // Movement
        relativePositioning: false,
        sizeGrowth: -1
    },

    ori_spike_trail: {
        spriteName: 'color_white',
        size: [100, 10],

        emissionRate: 100,
        maxParticles: 1000,
        lifeSpan: 0.1,

        fadeOutStartTime: 0,

        // Movement
        relativePositioning: false,
        sizeGrowth: -10
    },

    ori_weapon_ready: {
        spriteName: 'flake_white',
        size: [18, 18],
        sizeMultiplier: [0.75, 1.25],

        emissionRate: 0,
        maxParticles: 33,
        lifeSpan: 0.6,

        emissionAngle: [0, 360],
        emissionForce: [250, 350],
        forceResistence: 5,

        spawnBox: [[-3, -3], [3, 3]],
        fadeOutStartTime: 0.3,

        // Movement
        relativePositioning: false,
        sizeGrowth: -3
    },

    ori_hammer_charge: {
        spriteName: 'flake_white',
        size: [25, 25],

        emissionRate: 0,
        maxParticles: 1,
        lifeSpan: 1000,

        rotationSpeed: 45,
        fadeInTime: 1,

        relativePositioning: true,
        sizeGrowth: 9 / 2,
        maxSize: 9,
    },

    health_shatter_splash: {
        spriteName: 'flake_green',
        size: [15, 15],
        sizeMultiplier: [0.75, 1.25],

        emissionRate: 0,
        maxParticles: 33,
        lifeSpan: 0.6,

        spawnBox: [[-5, -1.5], [5, 1.5]],
        emissionAngle: [0, 360],
        emissionForce: [100, 300],
        forceResistence: 5,

        fadeOutStartTime: 0.3,

        // Movement
        relativePositioning: false,
        sizeGrowth: -3
    },
    
    energy_shatter_splash: {
        spriteName: 'flake_cyan',
        size: [15, 15],
        sizeMultiplier: [0.75, 1.25],

        emissionRate: 0,
        maxParticles: 33,
        lifeSpan: 0.6,

        spawnBox: [[-5, -1.5], [5, 1.5]],
        emissionAngle: [0, 360],
        emissionForce: [100, 300],
        forceResistence: 5,

        fadeOutStartTime: 0.3,

        // Movement
        relativePositioning: false,
        sizeGrowth: -3
    },

    ori_special_explosion_shockwave: {
        spriteName: 'shockwave',
        size: [2, 2],

        emissionRate: 0,
        maxParticles: 1,
        lifeSpan: 0.15,

        fadeOutStartTime: 0.05,

        sizeGrowth: 600,
    }
}