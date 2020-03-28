import { HitboxBase } from "../Bases/HitboxBase";

export type CollisionDelegate = (trigerredBy: HitboxBase) => void;
export type UpdateDelegate = () => void;