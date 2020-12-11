const _atr: number = Math.PI / 180;
const _rta: number = 180 / Math.PI;

export class ScalarUtil {
    static Shake = (): number => Math.random() * 2 - 1

    static ToRadian = (angle: number): number => angle * _atr;
    static ToAngle = (radian: number): number => radian * _rta;

    static RandomRange = (min: number, max: number): number => (max - min) * Math.random() + min;
    static RandomIntRange = (min: number, max: number): number => Math.floor(ScalarUtil.RandomRange(min, max));
    static Clamp = (min: number, value: number, max: number): number => Math.min(max, Math.max(value, min));
    static Round = (value: number): number => Math.floor(value + 0.5);
    static Avarage = (val1: number, val2: number): number => (val1 + val2) / 2;

    static ClampToIncrement = (value: number, increment: number): number => {
        const min = value - value % increment
        const max = min + increment;
        return Math.abs(value - min) < Math.abs(max - value) ? min : max;
    }

    static OneOrRange = (oor: number | [number, number]): number => {
        if (oor[0] === undefined) return oor as number;
        return ScalarUtil.RandomRange(oor[0], oor[1]);
    }

    static IsPowerOf2 = (num: number): boolean => {
        const l = Math.log(num) / Math.log(2);
        return l == Math.floor(l);
    }

    static DiagonalLength = (width: number, height: number): number => Math.sqrt(width * width + height * height);

    static IsAngleFacingRight = (angle: number): boolean => !ScalarUtil.IsAngleFacingLeft(angle);
    static IsAngleFacingLeft = (angle: number): boolean => {
        angle %= 360;
        return (angle >= 90 && angle < 270) || (angle < -90 && angle >= -270);
    }

    static IsAngleFacingDown = (angle: number): boolean => !ScalarUtil.IsAngleFacingUp(angle);
    static IsAngleFacingUp = (angle: number): boolean => {
        angle %= 360;
        return (angle >= 0 && angle < 180) || (angle < -180 && angle >= -360);
    }
}