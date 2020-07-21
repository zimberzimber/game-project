const _atr: number = Math.PI / 180;
const _rta: number = 180 / Math.PI;

export class ScalarUtil {
    static Shake = (): number => Math.random() * 2 - 1

    static ToRadian = (angle: number): number => angle * _atr;
    static ToAngle = (radian: number): number => radian * _rta;

    static RandomRange = (min: number, max: number): number => (max - min) * Math.random() + min;
    static Clamp = (min: number, value: number, max: number): number => Math.min(max, Math.max(value, min));
    static Round = (value: number): number => Math.floor(value + 0.5);

    static OneOrRange = (oor: number | [number, number]): number => {
        if (oor[0] === undefined)
            return oor as number;
        return ScalarUtil.RandomRange(oor[0], oor[1]);
    }

    static IsPowerOf2 = (num: number): boolean => {
        const l = Math.log(num) / Math.log(2);
        return l == Math.floor(l);
    }
}