import { SimpleAnimatorComponent, TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { Vec2 } from "../../Models/Vectors";
import { Game } from "../../Workers/Game";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { PlayerEntity } from "../Player/PlayerRoot";
import { ProjectileSeeker } from "../Projectiles/Enemy/Seeker";

const cfg = {
    health: 10,
    hitboxPolygon: [[20, 25], [-20, 25], [-20, -25], [20, -25]] as Vec2[],
    spriteSize: [40, 50] as Vec2,
    animationSpeed: 10, // Frames per second
    frameCount: 4,
    sprite: "enemy",

    missiles: {
        interval: 3,
        count: 5,
        shotDelay: 0.1
    }
}

export class EnemyShooter extends GameplayInteractiveEntityBase {
    private dd: DrawDirectiveAnimatedImage;

    constructor(parent: GameEntityBase | void | null) {
        super(parent, cfg.health, HitboxType.Polygonal, cfg.hitboxPolygon, CollisionGroup.Enemy, CollisionGroup.Player, TriggerState.OnEnterTrigger);
        this.dd = new DrawDirectiveAnimatedImage(this, cfg.sprite, cfg.spriteSize);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        new SimpleAnimatorComponent(this, 1 / cfg.animationSpeed, true, this.dd, cfg.frameCount).Start();

        let fired = 0;
        const shootTimer = new TimerComponent(this, cfg.missiles.shotDelay, true);
        const burstTimer = new TimerComponent(this, cfg.missiles.interval, false);

        shootTimer.OnTimesUpCallback = () => {
            fired++;
            const p = new ProjectileSeeker(Game.GetEntitiesOfType(PlayerEntity, false)[0]);
            p.Transform.Rotation = Math.random() * 90 + 45;

            if (fired >= cfg.missiles.count) {
                shootTimer.Stop();
                burstTimer.Restart();
            }
        };

        burstTimer.OnTimesUpCallback = () => {
            fired = 0;
            shootTimer.Restart();
        };

        burstTimer.Start();
    }

    Update(delta: number) {
        super.Update(delta);
        this.Transform.Rotate(10 * delta);
    }
}