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
}