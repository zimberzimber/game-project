import { ProjectileOriStar } from "../../Entities/Projectiles/Player/OriStar";
import { ScalarUtil } from "../../Utility/Scalar";
import { WeaponState, IWeaponStateParams } from "./WeaponStateBase";

const starShotCooldown = 0.75;
const maxStars = 3;

// Maing just one state as the special should be available at any time.
export class SpecialState extends WeaponState {
    protected _canFirePrimary = true;
    protected _canFireSecondary = true;

    protected _shotCooldown = 0;

    protected _stars: (ProjectileOriStar | null)[] = [null, null, null];

    PrimaryFire(params: IWeaponStateParams) {
        // Spawn star
        this._shotCooldown = starShotCooldown;
        this._canFirePrimary = false;
        this._weaponLocked = true;

        const a = ScalarUtil.IsAngleFacingRight(params.angle) ? 0 : 180;

        for (let i = 0; i < this._stars.length; i++) {
            if (this._stars[i] === null) {
                this._stars[i] = new ProjectileOriStar(this._handler.Entity, a);
                break;
            }
        }
    }

    SecondaryFire(params: IWeaponStateParams) {
        let energy = this._handler.GetEnergy();
        let consume = 0;

        for (let i = 0; i < this._stars.length; i++) {
            if (this._stars[i]) {
                if (consume >= energy) break;
                consume++;

                this._stars[i]!.Explode();
                this._stars[i] = null;
            }
        }

        this._handler.TryConsumeEnergy(consume);
    }

    private get StarCount(): number {
        return this._stars.filter(s => s).length;
    }

    Update(dt: number) {
        for (let i = 0; i < this._stars.length; i++) {
            const s = this._stars[i];
            if (s && !s.ProjectileActive)
                this._stars[i] = null;
        }

        const stars = this.StarCount;
        if (!this._canFirePrimary) {
            this._shotCooldown -= dt;

            if (this._shotCooldown <= 0 && stars < maxStars)
                this._canFirePrimary = true;
        } else {
            this._weaponLocked = stars > 0;
        }
    }
}

export const InitialSpecialState = SpecialState;