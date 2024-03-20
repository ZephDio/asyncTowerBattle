import { HitBox } from "../../../shared/hitboxes";

export abstract class Unit {
  abstract type: string;
  abstract hitbox: HitBox;
}
