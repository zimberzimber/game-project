import { Game } from "../Workers/Game";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { CheckCollision } from "../Workers/CollisionChecker";
import { Camera } from "../Workers/CameraManager";
import { Rendering } from "../Workers/RenderingPipeline";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { GameEntityBase } from "../Entities/EntityBase";
import { PlayerEntity } from "../Entities/Player/PlayerRoot";
import { DrawDirectiveScrollableTiledImage } from "../Components/Visual/DrawDirectiveTiledImage";
import { IGameState } from "./GameStateBase";
import { ButtonBasicEntity } from "../Entities/Ui/ButtonBasic";
import { WindowBasicEntity } from "../Entities/Ui/WindowBasic";

export class GameStateGame implements IGameState, IConfigObserver {
    private _debugDraw: boolean = Config.GetConfig('debugDraw', false);

    OnObservableNotified(args: IConfigEventArgs): void {
        switch (args.field) {
            case 'debugDraw':
                this._debugDraw = args.newValue;
                if (!this._debugDraw)
                    Rendering.SetDrawData('debug', null);
                break;
        }
    }

    OnActivated(): void {
        this._debugDraw = Config.GetConfig('debugDraw', false);
        Config.Observable.Subscribe(this);

        let p = new PlayerEntity();
        Game.AddEntity(p);

        let w = new WindowBasicEntity(null, [100, 67], 10, 'e');
        Game.AddEntity(w);

        // for (let i = 0; i < 3; i++) {
        //     for (let j = 0; j < 3; j++) {
        //         setTimeout(() => {
        //             let p1 = new PlayerEntity();
        //             p1.transform.Position = [25 * i - 150, 25 * j - 150]
        //             Game.AddEntity(p1);
        //         }, (i + 1) * 100 + (j + 1) * 10)
        //     }
        // }
        // let test = new TestEntity();
        // Game.AddEntity(test);
        let button = new ButtonBasicEntity(null, [30, 10], 'button_wide');
        Game.AddEntity(button);

        button.OnClick = () => console.log('badabing');
        button.OnUnclick = (isInside: boolean) => console.log(`Badaboom in: ${isInside}`);
        button.HoverEvent = (hovered: boolean) => console.log(`Hovered: ${hovered}`);

        let temp = new GameEntityBase();
        temp.AddComponent(new DrawDirectiveScrollableTiledImage(temp, 'water', [50, 50], [64, 500], [0, 10]));
        Game.AddEntity(temp);
    }

    OnDeactivated(): void {
        Config.Observable.Unsubscribe(this);
    }

    Update(delta: number): void {
        // Update all entities
        Game.GetAllEntities().forEach(e => e.Update(delta));

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

        if (this._debugDraw) {
            const lines: { red: number[][]; yellow: number[][]; } = { red: [], yellow: [] };
            const hitboxes = Game.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true) as HitboxBase[];
            hitboxes.forEach((hb: HitboxBase) => {
                // Skip draws outside of view
                const hTrans = hb.Parent.worldRelativeTransform;
                const hRadius = hb.BoundingRadius * Math.max(hb.Parent.worldRelativeTransform.Scale[0], hb.Parent.worldRelativeTransform.Scale[1]);

                if (Camera.IsInView(hTrans.Position, hRadius)) {
                    const hData: number[] | null = hb.DebugDrawData;
                    if (hData) {
                        if (hb.TriggerState == TriggerState.NotTrigger) {
                            lines.yellow.push(hData);
                        }
                        else {
                            lines.red.push(hData);
                        }
                    }
                }
            });
            Rendering.SetDrawData('debug', lines);
        }
    }
}
