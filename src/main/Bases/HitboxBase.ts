import { ComponentBase } from "./ComponentBase";
import { HitboxType } from "../Models/HitboxType";
import { CollisionDelegate } from "./Delegates";
import { _G } from "../Main";
import { TriggerState } from "../Models/TriggerState";
import CheckCollision from "../Workers/HitboxCollisionChecker";

export abstract class HitboxBase extends ComponentBase {
    static DebugHitboxColor = "#FFFF00";
    static DebugTriggerColor = "#FF0000";

    HitboxType: HitboxType = HitboxType.Base;
    HitboxOverallRadius: number = 0;
    CollisionEnabled: boolean = true;
    private TriggerState: TriggerState = TriggerState.NotTrigger;

    // Stores objects it already collided with, for on enter and one time trigerring
    private PreviousCollisions: HitboxBase[] | undefined;

    Update() {
        // Yes yes, ugly double code and all that
        // But I'm calling the 'if' only once instead of n times :>

        if (this.TriggerState == TriggerState.OnEnterTrigger) {
            if (this.UncollisionScript == undefined) {
                for (let i = 0; i < this.PreviousCollisions.length; i++) {
                    if (!CheckCollision(this, this.PreviousCollisions[i]))
                        this.PreviousCollisions[i] = null;
                }
            } else {
                for (let i = 0; i < this.PreviousCollisions.length; i++) {
                    if (!CheckCollision(this, this.PreviousCollisions[i])) {
                        this.UncollisionScript(this.PreviousCollisions[i]);
                        this.PreviousCollisions[i] = null;
                    }
                }
            }

            this.PreviousCollisions = this.PreviousCollisions.filter(h => h != null);
        }
    };

    GetTriggerState(): TriggerState {
        return this.TriggerState;
    }

    SetTriggerState(newState: TriggerState): void {
        if (this.TriggerState == newState) return;

        this.TriggerState = newState;
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
        if (this.TriggerState == TriggerState.OnEnterTrigger || this.TriggerState == TriggerState.OneTimeTrigger) {
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
    abstract DrawHitbox(context: any): void;
}