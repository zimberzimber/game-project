import { Game } from "../Workers/Game";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { CheckCollision } from "../Workers/CollisionChecker";
import { DrawDirectiveText, TextAlignmentHorizontal, TextAlignmentVertical } from "../Components/DrawDirectives/DrawDirectiveText";
import { Camera } from "../Workers/CameraManager";
import { Rendering } from "../Workers/RenderingPipeline";
import { Config, IConfigObserver, IConfigEventArgs } from "../Proxies/ConfigProxy";
import { SoundType } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { SoundDefinitions } from "../AssetDefinitions/SoundDefinitions";
import { PlayerEntity } from "../Entities/Player";
import { TestEntity } from "../Entities/Test";
import { UiEntityBase } from "../Entities/EntityBase";
import { PlayerEntity2 } from "../Entities/PlayerEntities/PlayerRoot";


export abstract class GameStateBase {
    abstract OnActivated(): void;
    abstract OnDeactivated(): void;
    abstract Update(delta: number): void;
}

class GameStateIntro extends GameStateBase {
    OnActivated(): void {
        throw new Error("Method not implemented.");
    }
    OnDeactivated(): void {
        throw new Error("Method not implemented.");
    }
    Update(delta: number): void {
        throw new Error("Method not implemented.");
    }

}

class GameStateMainMenu extends GameStateBase {
    OnActivated(): void {
        throw new Error("Method not implemented.");
    }
    OnDeactivated(): void {
        throw new Error("Method not implemented.");
    }
    Update(delta: number): void {
        throw new Error("Method not implemented.");
    }

}

class GameStateGame extends GameStateBase implements IConfigObserver {
    private _debugDraw: boolean = Config.GetConfig('debugDraw', false);

    OnObservableNotified(args: IConfigEventArgs): void {
        switch (args.field) {
            case 'debugDraw':
                this._debugDraw = args.newValue;
                if (!this._debugDraw)
                    Rendering.SetDrawData('debug', null)
                break;
        }
    }

    OnActivated(): void {
        this._debugDraw = Config.GetConfig('debugDraw', false);
        Config.Observable.Subscribe(this);

        let p = new PlayerEntity2();
        Game.AddEntity(p);

        let test = new TestEntity();
        test.transform.Position = [100, 100];
        test.transform.Scale = [5, 5];
        Game.AddEntity(test);
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
            const lines: { red: number[][], yellow: number[][] } = { red: [], yellow: [] };
            const hitboxes = Game.GetAllComponentsOfTypeFromEntityCollection(HitboxBase, allEntities, true) as HitboxBase[];
            hitboxes.forEach((hb: HitboxBase) => {
                // Skip draws outside of view
                const hTrans = hb.Parent.worldRelativeTransform;
                const hRadius = hb.BoundingRadius * Math.max(hb.Parent.worldRelativeTransform.Scale[0], hb.Parent.worldRelativeTransform.Scale[1]);

                if (Camera.IsInView(hTrans.Position, hRadius)) {
                    const hData: number[] | null = hb.DebugDrawData;
                    if (hData) {
                        if (hb.TriggerState == TriggerState.NotTrigger) {
                            lines.yellow.push(hData)
                        } else {
                            lines.red.push(hData)
                        }
                    }
                }
            })
            Rendering.SetDrawData('debug', lines)
        }
    }
}

class GameStatePaused extends GameStateBase {
    temp: UiEntityBase | undefined = undefined;

    OnActivated(): void {
        Audio.SetTagVolume(SoundType.Music, 0.5);
        Audio.PlaySound(SoundDefinitions.ui);

        this.temp = new UiEntityBase();
        this.temp.transform.Position = Camera.Transform.Position;
        const t = new DrawDirectiveText(this.temp, 20, 'PAUSED', TextAlignmentHorizontal.Center, TextAlignmentVertical.Center);
        this.temp.AddComponent(t);
        Game.AddEntity(this.temp);

    }

    OnDeactivated(): void {
        this.temp?.Delete();
        delete this.temp;
        Audio.SetTagVolume(SoundType.Music, 1);
    }

    Update(delta: number): void {

    }
}

export const GameStateDictionary = {
    Game: new GameStateGame(),
    Paused: new GameStatePaused()
}