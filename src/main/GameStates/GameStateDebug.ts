import { IGameState } from "./GameStateBase";
import { Game } from "../Workers/Game";
import { PlayerEntity } from "../Entities/Player/PlayerRoot";
import { DrawDirectiveFullImage } from "../Components/Visual/DrawDirectiveFullImage";
import { GameEntityBase } from "../Entities/EntityBase";
import { Camera } from "../Workers/CameraManager";
import { LightComponent } from "../Components/Visual/Light";
import { Vec2Utils } from "../Utility/Vec2";
import { EnemyFloaterEntity } from "../Entities/Enemies/Floater";
import { CollisionGroup, HitboxType, TriggerState } from "../Models/CollisionModels";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { CheckCollision } from "../Workers/CollisionChecker";
import { EnemyBaseEntity } from "../Entities/Enemies/EnemyBase";
import { EnemyShooter } from "../Entities/Enemies/Shooter";

export class GameStateDebug implements IGameState {
    OnActivated(): void {
        new PlayerEntity();

        const bge = new GameEntityBase();
        bge.Transform.Position = Vec2Utils.MultS(Camera.Transform.Scale, -0.5);
        new DrawDirectiveFullImage(bge, 'bg_00', Camera.Transform.Scale);
        bge.Transform.Depth = -10;

        // const l1e = new GameEntityBase();
        // l1e.Transform.Position = [50, 0];
        // l1e.Transform.Depth = 3;
        // this._l1 = new LightComponent(l1e, [0, -1, 1], 150, 1);

        // const l2e = new GameEntityBase();
        // l2e.Transform.Position = [-50, 0];
        // l2e.Transform.Depth = 2;
        // this._l2 = new LightComponent(l2e, [0, 1, -1], 150, 1);

        new LightComponent(new GameEntityBase(), [1, 1, 1], 1000, 1);

        const floater1 = new EnemyShooter();
        floater1.Transform.Position = [100, -100];
    }

    OnDeactivated(): void {
    }

    Update(delta: number): void {
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
    }
}
