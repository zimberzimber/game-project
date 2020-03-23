import { HitboxBase } from "./HitboxBase";

export type CollisionDelegate = (trigerredBy: HitboxBase) => void;
export type UpdateDelegate = () => void;