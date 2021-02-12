import { ProjectileCollisionDictionary, ProjectileDictionary } from "../../AssetDefinitions/BasicProjectileDefinitions";
import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Game } from "../../Workers/Game";
import { EnergyCollectibleEntity, HealthCollectibleEntity, ScoreCollectibleEntity } from "../Collectibles/Collectibles";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { PlayerEntity } from "../Player/PlayerRoot";
import { ProjectileBasic, ProjectileBasicWeighted } from "../Projectiles/ProjectileBase";
import { BasicGibEntity } from "../Visual/Gibs";
import { ParticleFireAndForgetEntity } from "../Visual/Particle";

const cfg = {
    health: 10,
    hitboxPolygon: [[20, 25], [-20, 25], [-20, -25], [20, -25]] as Vec2[],
    spriteSize: [48, 52] as Vec2,
    animationSpeed: 10, // Frames per second
    frameCount: 2,
    bobbingFrameCount: 4,
    idleFrameCount: 4,
    sprite: "spider",
    stringWidth: 2,

    descentDistance: 250,
    descentSpeed: 300,
    bounceSpeed: 250,
    bounceDistance: 10,

    fireInterval: 1.5,
    projectileSpread: 20,
}

enum SpiderState { Descending, Bobbing, Hanging }
export class EnemyHangingSpider extends GameplayInteractiveEntityBase {
    private dd: DrawDirectiveAnimatedImage;
    private state: SpiderState = SpiderState.Descending;
    private animationTimer: TimerComponent;
    private descended: number = 0
    private stringDd: DrawDirectiveStaticImage;

    constructor(parent: GameEntityBase | void | null) {
        super(parent, cfg.health, HitboxType.Polygonal, cfg.hitboxPolygon, CollisionGroup.Enemy, CollisionGroup.Player, TriggerState.OnEnterTrigger);
        this.dd = new DrawDirectiveAnimatedImage(this, cfg.sprite, cfg.spriteSize);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this.dd.Frame = "drop_0"

        this.stringDd = new DrawDirectiveStaticImage(this, "spider_string", [cfg.stringWidth, 0]);
        this.stringDd.DrawOffset = [0, cfg.spriteSize[1] * 0.5];
        this.stringDd.Alignment = { vertical: VerticalAlignment.Bottom, horizontal: HorizontalAlignment.Middle };

        const fireTimer = new TimerComponent(this, cfg.fireInterval, true);
        fireTimer.OnTimesUpCallback = () => {
            const pos = Vec2Utils.Sum(this.WorldRelativeTransform.Position, [0, -10]);
            const depth = this.Transform.Depth + 1;
            const player = Game.GetEntitiesOfType(PlayerEntity)[0];
            const angle = player ? Vec2Utils.GetAngle(pos, player.WorldRelativeTransform.Position) : 180;

            new ProjectileBasic(ProjectileDictionary.spider_spit, ProjectileCollisionDictionary.enemy_projectile, pos, angle, depth);
            new ProjectileBasic(ProjectileDictionary.spider_spit, ProjectileCollisionDictionary.enemy_projectile, pos, angle + cfg.projectileSpread, depth);
            new ProjectileBasic(ProjectileDictionary.spider_spit, ProjectileCollisionDictionary.enemy_projectile, pos, angle - cfg.projectileSpread, depth);
        }

        let frame = 1; // skipping 0 as it starts there anyways
        this.animationTimer = new TimerComponent(this, 1 / cfg.animationSpeed, true);
        this.animationTimer.OnTimesUpCallback = () => {
            if (this.state == SpiderState.Bobbing) {
                this.dd.Frame = `drop_${frame}`;

                frame++;
                if (frame >= cfg.bobbingFrameCount) {
                    this.state = SpiderState.Hanging;
                    fireTimer.Start();
                    frame = 0;
                }
            } else if (this.state == SpiderState.Hanging) {
                this.dd.Frame = `idle_${frame}`;
                frame = (frame + 1) % cfg.idleFrameCount;
            }
        }
    }

    Update(delta: number) {
        super.Update(delta);

        if (this.state == SpiderState.Descending) {
            this.descended += cfg.descentSpeed * delta;
            this.Transform.Translate(0, cfg.descentSpeed * -delta);
            this.stringDd.Size = [cfg.stringWidth, this.descended];
            if (this.descended >= cfg.descentDistance + cfg.bounceDistance) {
                this.state = SpiderState.Bobbing;
                this.animationTimer.Start();
                this.descended = 0;
            }
        } else if (this.state == SpiderState.Bobbing && this.descended < cfg.bounceDistance) {
            this.descended += cfg.bounceSpeed * delta
            this.Transform.Translate(0, cfg.bounceSpeed * delta);
        }
    }

    protected OnDied(): void {
        const gib = new BasicGibEntity(null, 'spider_dead');
        gib.Transform.CopyFromTransform(this.WorldRelativeTransform);

        const stringGib = new ParticleFireAndForgetEntity('spider_string_gib');
        stringGib.Transform.CopyFromTransform(this.WorldRelativeTransform);
        stringGib.Burst();

        const trans = this.WorldRelativeTransform;
        const tPos = trans.Position;
        const o = 20;
        const oh = o / 2;

        const score = new ScoreCollectibleEntity();
        score.Transform.SetTransformParams([tPos[0] + Math.random() * o - oh, tPos[1] + Math.random() * o - oh], null, null, trans.Depth);

        const hp = new HealthCollectibleEntity();
        hp.Transform.SetTransformParams([tPos[0] + Math.random() * o - oh, tPos[1] + Math.random() * o - oh], null, null, trans.Depth);

        const energy = new EnergyCollectibleEntity();
        energy.Transform.SetTransformParams([tPos[0] + Math.random() * o - oh, tPos[1] + Math.random() * o - oh], null, null, trans.Depth);

        super.OnDied();
    }
}