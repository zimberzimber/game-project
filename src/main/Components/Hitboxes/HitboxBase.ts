import { ComponentBase } from "../../Bases/ComponentBase";
import { CollisionDelegate } from "../../Models/Delegates";
import { CheckCollision } from "../../Workers/HitboxCollisionChecker";
import { WebglDrawData } from "../../Models/WebglDrawData";
import { HitboxType, TriggerState, CollisionGroup } from "../../Models/CollisionModels";

export abstract class HitboxBase extends ComponentBase {
    readonly HitboxType: HitboxType = HitboxType.Base;
    _hitboxOverallRadius: number = 0;
    get HitboxOverallRadius(): number { return this._hitboxOverallRadius; }

    CollisionGroup: CollisionGroup = CollisionGroup.None;
    CollideWithGroup: CollisionGroup = CollisionGroup.None;

    private _triggerState: TriggerState = TriggerState.NotTrigger;

    // Stores objects it already collided with, for on enter and one time trigerring
    private PreviousCollisions: HitboxBase[] | undefined;

    Update() {
        // Yes yes, ugly double code and all that
        // But I'm calling the 'if' only once instead of N times :>
        if (this.PreviousCollisions && this.TriggerState == TriggerState.OnEnterTrigger) {
            const markedIndexes: number[] = [];

            if (this.UncollisionScript == undefined) {
                for (let i = 0; i < this.PreviousCollisions.length; i++) {
                    if (!CheckCollision(this, this.PreviousCollisions[i]))
                        markedIndexes.push(i);
                }
            } else {
                for (let i = 0; i < this.PreviousCollisions.length; i++) {
                    if (!CheckCollision(this, this.PreviousCollisions[i])) {
                        this.UncollisionScript(this.PreviousCollisions[i]);
                        markedIndexes.push(i);
                    }
                }
            }

            for (let i = markedIndexes.length - 1; i >= 0; i--) {
                this.PreviousCollisions.splice(markedIndexes[i], 1);
            }

        }
    };

    get TriggerState(): TriggerState { return this._triggerState }
    set TriggerState(newState: TriggerState) {
        if (this.TriggerState == newState) return;

        this._triggerState = newState;
        switch (newState) {
            case TriggerState.NotTrigger:
                this.PreviousCollisions = undefined;
                break;
            case TriggerState.ContinuousTrigger:
                this.PreviousCollisions = undefined;
                break;
            case TriggerState.OnEnterTrigger:
                this.PreviousCollisions = [];
                break;
            case TriggerState.OneTimeTrigger:
                this.PreviousCollisions = [];
                break;
            default:
                this.PreviousCollisions = undefined;
                break;
        }
    }

    // Script called when an object leaves the collision range. Only relevant for trigger state 'OnEnterTrigger'
    UncollisionScript: CollisionDelegate | undefined;

    // Script called when a trigger collides with this object
    CollisionScript: CollisionDelegate | undefined;


    CollideWith(collidedWith: HitboxBase): void {
        if (this.PreviousCollisions && (this.TriggerState == TriggerState.OnEnterTrigger || this.TriggerState == TriggerState.OneTimeTrigger)) {
            if (this.PreviousCollisions.indexOf(collidedWith) != -1)
                return;
            else
                this.PreviousCollisions.push(collidedWith);
        }

        // Call the collision script if defined
        if (this.CollisionScript != undefined)
            this.CollisionScript(collidedWith);
    }

    protected abstract CalculateOverallHitboxRadius(): void;
    abstract get DebugDrawData(): WebglDrawData | null;
}