import { HitBox } from "../../../shared/hitboxes";
import { Recruit } from "../../../shared/physic";
import { Unit } from "../entity/units";

export abstract class UnitRecruit<U extends Unit> implements Recruit {
  abstract maxLife: number;
  abstract speed: number;
  abstract type: U["type"];
  abstract hitbox: HitBox;
}
