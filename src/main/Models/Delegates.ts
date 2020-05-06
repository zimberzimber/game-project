import { HitboxBase } from "../Components/Hitboxes/HitboxBase";

export type CollisionDelegate = (trigerredBy: HitboxBase) => void;
export type UpdateDelegate = () => void;