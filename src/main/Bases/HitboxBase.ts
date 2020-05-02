import { ComponentBase } from "./ComponentBase";
import { HitboxType } from "../Models/HitboxType";
import { CollisionDelegate } from "../Models/Delegates";
import { TriggerState } from "../Models/TriggerState";
import { CheckCollision } from "../Workers/HitboxCollisionChecker";
import { WebglDrawData } from "../Models/WebglDrawData";

export abstract class HitboxBase extends ComponentBase {
    HitboxType: HitboxType = HitboxType.Base;
    HitboxOverallRadius: number = 0;
    CollisionEnabled: boolean = true;
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


    OnCollision(collidedWith: HitboxBase): void {
        if (this.PreviousCollisions && (this.TriggerState == TriggerState.OnEnterTrigger || this.TriggerState == TriggerState.OneTimeTrigger)) {
            if (this.PreviousCollisions.indexOf(collidedWith) != -1)
                return;
            else
                this.PreviousCollisions.push(collidedWith);
        }

        // Call the collision script if defined
        if (this.CollisionScript != undefined)
            this.CollisionScript(collidedWith);

        // Call the other colliders collision script if its not a trigger, and the script is defined.
        // Triggers will trigger their own script from the collision.
        if (collidedWith.TriggerState == TriggerState.NotTrigger && collidedWith.CollisionScript != undefined)
            collidedWith.CollisionScript(this);
    }

    protected abstract CalculateOverallHitboxRadius(): void;
    abstract get DebugDrawData(): WebglDrawData | null;
}