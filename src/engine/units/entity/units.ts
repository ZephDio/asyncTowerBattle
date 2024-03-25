import { HitBox } from "../../../shared/hitboxes";

export abstract class Unit {
  abstract type: string;
  abstract hitbox: HitBox;
  abstract attackSpeed: number;
  abstract attackDamage: number;
}
