import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Bases/HitboxBase";
import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { ToDrawLayerContainer } from "../Models/ToDrawLayerContainer";
import { TestEntity } from "../Entities/Test";
import { Vec2 } from "../Models/Vec2";
import { TriggerState } from "../Models/TriggerState";
import CheckCollision from "./HitboxCollisionChecker";
import { IDOMDependant } from "../Bases/MiscInterfaces";

export class Game implements IDOMDependant {
    canvas: any;
    context: any;
    interval: any;
    entities: EntityBase[];
    FPSInterval: number;
    playerEntity: EntityBase;
    paused: boolean = false;

    frameDelta: number = 0;
    oldFrameTime: number = new Date().getTime();

    fpsCounter: number = 0;
    oldTime: number = new Date().getTime();
    fpsDisplay: number = 0;

    OnDomLoaded(): void {
        this.canvas = document.getElementById("game-canvas");
        this.context = this.canvas.getContext("webgl");



        
        this.context.imageSmoothingEnabled = false;
        this.entities = [];

        this.canvas.width = 600;
        this.canvas.height = 600;
        this.canvas.getContext("2d").imageSmoothingEnabled = false;

        this.playerEntity = new PlayerEntity();
        this.AddEntity(this.playerEntity);

        for (let i = 0; i < 1000; i++) {
            const p = new TestEntity();
            p.transform.position = new Vec2(600 * Math.random(), 600 * Math.random());
            this.AddEntity(p);
        }

        this.context.font = "10px";
        this.context.fillStyle = "yellow";
        this.Start();
    }

    constructor() {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.entities = [];

        this.canvas.width = 600;
        this.canvas.height = 600;
    }

    Start(): void {
        // See reasoning under 'Update'
        // this.interval = setInterval(this.Update.bind(this), 1000 / _G.FPS);
        requestAnimationFrame(this.Update.bind(this))
    }

    AddEntity(entity: EntityBase): void {
        this.entities.push(entity);
    }

    GetAllComponentsOfType(type: any) {
        let returned: ComponentBase[] = [];
        this.entities.forEach(e => returned = returned.concat(e.GetComponentsOfType(type)));
        return returned;
    }

    Update(): void {
        requestAnimationFrame(this.Update.bind(this))

        const newFrameTime = new Date().getTime();
        this.frameDelta = (newFrameTime - this.oldFrameTime) / 1000;
        this.oldFrameTime = newFrameTime;

        // Do nothing if game is paused
        if (this.paused) return;

        // Update all entities
        this.entities.forEach(e => e.Update());

        let triggers: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() == TriggerState.NotTrigger) as HitboxBase[];

        triggers.forEach(t => colliders.forEach(c => {
            if (CheckCollision(t, c)) {
                t.OnCollision(c);
            }
        }));

        // Draw all drawables
        const dd = new ToDrawLayerContainer();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.GetAllComponentsOfType(DrawDirectiveBase).forEach(c => {
            const layer = (c as DrawDirectiveBase).DrawLayer;
            dd[layer] = dd[layer].concat(c);
        })
        dd.DrawAll(this.context);

        // Draw collisions if the option is enabled
        if (_G.DebugDraw) {
            this.fpsCounter++;
            this.GetAllComponentsOfType(HitboxBase).forEach(c => (c as HitboxBase).DrawHitbox(this.context))
            const time = new Date().getTime();

            if (time - this.oldTime >= 250) {
                this.fpsDisplay = Math.floor(this.fpsCounter / (time - this.oldTime) * 1000);
                this.oldTime = time;
                this.fpsCounter = 0;
            }

            this.context.fillText(this.fpsDisplay, 10, 10);
        }
    }

    // Entities need a collision class
    // Draw directive and collision should have separate values
    // Different projectiles will have their own classes extending Entity
}
