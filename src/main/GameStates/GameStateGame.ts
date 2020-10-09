import { Game } from "../Workers/Game";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { CheckCollision } from "../Workers/CollisionChecker";
import { GameEntityBase } from "../Entities/EntityBase";
import { PlayerEntity } from "../Entities/Player/PlayerRoot";
import { IGameState } from "./GameStateBase";
import { Log } from "../Workers/Logger";
import { StateManager } from "../Workers/GameStateManager";
import { SoundSingleInstanceComponent } from "../Components/Sound/SoundSingleInstance";
import { Audio } from "../Workers/SoundPlayer";
import { Camera } from "../Workers/CameraManager";
import { BackgroundControllerEntity } from "../Entities/Controllers/BackgroundController";
import { LevelDictionary } from "../AssetDefinitions/LevelDefinitions";
import { Vec2Utils } from "../Utility/Vec2";
import { MiscUtil } from "../Utility/Misc";

export class GameStateGame implements IGameState {
    private _speed = 0;
    private _levelLength = 0;
    private _player: PlayerEntity;
    private _bge: BackgroundControllerEntity;

    OnActivated(args: any): void {
        if (!args || typeof (args) != 'string') {
            Log.Error(`Returning to title, invalid level name: ${args}`);
            StateManager.ChangeState('title');
            return;
        }

        const cfg = LevelDictionary[args];
        if (!cfg) {
            Log.Error(`Returning to title, level does not exist: ${args}`);
            StateManager.ChangeState('title');
            return;
        }

        Camera.Transform.Position = [0, 0];
        this._speed = cfg.speed;
        this._levelLength = cfg.length;

        for (const ent of cfg.entities) {
            // Check if the passed type is a game entity type.
            if (!MiscUtil.IsTypeChildOfType(ent.entityType, GameEntityBase)) {
                Log.Warn(`Attempted to initialize non-entity type ${ent.entityType} as entity. Skipping.`)
                continue;
            }

            // Pass constructor arguments if there are any past the parent.
            const e: GameEntityBase = new ent.entityType(undefined, ...ent.contructorArgs || []);
            if (ent.position) e.Transform.Position = ent.position;
            if (ent.rotation !== undefined) e.Transform.Rotation = ent.rotation;
            if (ent.scale) e.Transform.Scale = ent.scale;
            if (ent.depth !== undefined) e.Transform.Depth = ent.depth;
        }

        Audio.SetConvolverImpulse(cfg.reverb || null);
        if (cfg.music) {
            const musC = new SoundSingleInstanceComponent(new GameEntityBase(), cfg.music, false);
            musC.Play();
        }

        this._player = new PlayerEntity();

        this._bge = new BackgroundControllerEntity(cfg.bgConfig);
        this._bge.Transform.Position = Vec2Utils.DivS(Camera.Transform.Scale, -2);

        // const dd = new DrawDirectiveScrollableTiledImage(new GameEntityBase(), 'water', [50, 50], [args.length, 500], [0, 10]);
        // dd.VerticalAlignment = VerticalAlignment.Middle;
        // dd.DepthOffset = 5;
    }

    OnDeactivated(): void {
        Game.RemoveAllEntities();
        delete this._player;
        delete this._bge;
    }

    Update(delta: number): void {
        // Scroll camera, move player and background accordingly
        this._player.Transform.Translate(this._speed * delta, 0);
        this._bge.Transform.Translate(this._speed * delta, 0);
        Camera.Transform.Translate(this._speed * delta, 0);

        // Update all entities
        Game.GetAllEntities().forEach(e => e.Update(delta));

        // Collision checking
        // Updating all first and then reobtaining the list because entities may have been created due to other entities updating.
        const allEntities = Game.GetAllEntities();
        let triggers: HitboxBase[] = Game.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true).filter(c => (c as HitboxBase).TriggerState != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = Game.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true).filter(c => (c as HitboxBase).TriggerState == TriggerState.NotTrigger) as HitboxBase[];

        for (let i = 0; i < triggers.length; i++) {
            const t = triggers[i];
            if (t.CollisionGroup == CollisionGroup.None && t.CollideWithGroup == CollisionGroup.None)
                continue;

            for (let j = i + 1; j < triggers.length; j++) {
                const c = triggers[j];
                if (c.CollisionGroup == CollisionGroup.None && c.CollideWithGroup == CollisionGroup.None)
                    continue;

                if (t.CollideWithGroup & c.CollisionGroup && CheckCollision(t, c))
                    t.CollideWith(c);

                if (t.CollisionGroup & c.CollideWithGroup && CheckCollision(t, c))
                    c.CollideWith(t);
            }

            for (let j = 0; j < colliders.length; j++) {
                const c = colliders[j];
                if (c.CollisionGroup == CollisionGroup.None && c.CollideWithGroup == CollisionGroup.None)
                    continue;

                if (t.CollideWithGroup & c.CollisionGroup && CheckCollision(t, c))
                    t.CollideWith(c);

                if (t.CollisionGroup & c.CollideWithGroup && CheckCollision(t, c))
                    c.CollideWith(t);
            }
        }

        if (Camera.Transform.Position[0] >= this._levelLength) {
            StateManager.ChangeState('title');
        }
    }
}
