import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { PlayerEntity } from "../Entities.ts/Player";
import { IDOMDependant } from "../Bases/DOMDependant";
import { HitboxBase } from "../Bases/HitboxBase";
import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { ToDrawLayerContainer } from "../Models/ToDrawLayerContainer";
import { TestEntity } from "../Entities.ts/Test";
import { Vec2 } from "../Models/Vec2";
import { TriggerState } from "../Models/TriggerState";
import CheckCollision from "./HitboxCollisionChecker";

export class Game implements IDOMDependant {
    canvas: any;
    context: any;
    interval: any;
    entities: EntityBase[];
    FPSInterval: number;
    playerEntity: EntityBase;
    paused: boolean = false;

    OnDomLoaded(): void {
        this.canvas.getContext("2d").imageSmoothingEnabled = false;

        this.playerEntity = new PlayerEntity();
        this.AddEntity(this.playerEntity);

        let p = new TestEntity();
        p.transform.position = new Vec2(300, 300);
        this.AddEntity(p);

        this.Start();
    }

    constructor(canvas: any) {
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
        this.Update();
    }

    AddEntity(entity: EntityBase): void {
        this.entities.push(entity);
    }

    GetAllComponentsOfType(type: any) {
        let returned: ComponentBase[] = [];
        this.entities.map(e => returned = returned.concat(e.GetComponentsOfType(type)));
        return returned;
    }

    Update(): void {
        // Call the next update in X time after this one started instead of creating a new call each X times
        // Will prevent the event loop from flooding in cases where the machine can't keep up with the calls
        setTimeout(this.Update.bind(this), 1000 / _G.FPS)

        // Do nothing if game is paused
        if (this.paused) return;

        // Update all entities
        this.entities.map(e => e.Update());

        let triggers: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() == TriggerState.NotTrigger) as HitboxBase[];

        triggers.map(t => colliders.map(c => {
            if (CheckCollision(t, c)) {
                t.OnCollision(c);
            }
        }));

        // Draw all drawables
        const dd = new ToDrawLayerContainer();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.GetAllComponentsOfType(DrawDirectiveBase).map(c => {
            const layer = (c as DrawDirectiveBase).DrawLayer;
            dd[layer] = dd[layer].concat(c);
        })
        dd.DrawAll(this.context);

        // Draw collisions if the option is enabled
        if (_G.DrawPolygons)
            this.GetAllComponentsOfType(HitboxBase).map(c => (c as HitboxBase).DrawHitbox(this.context))
    }

    // Entities need a collision class
    // Draw directive and collision should have separate values
    // Different projectiles will have their own classes extending Entity
}
