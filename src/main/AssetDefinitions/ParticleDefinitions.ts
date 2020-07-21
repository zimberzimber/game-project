import { IParticleDefinition } from "../Models/ParticleModels";

export const particleDefinitions: { [key: string]: IParticleDefinition } = {
    test: {
        spriteName: 'asset_missing',
        size: [5, 5],
        sizeMultiplier: [0.5, 2],

        emissionRate: 33,
        maxParticles: 999,
        lifeSpan: 5,

        spawnBox: [[-2.5, 15], [2.5, 15]],

        // Movement
        emissionAngle: [105, 75],
        emissionForce: [300, 500],
        forceResistence: 0,
        gravity: [0, -10],
        rotationSpeed: 20,
        relativePositioning: false,
        sizeGrowth: -1,
    }
}