import { HitBox } from "../../../../shared/hitboxes";
import { Soldier } from "../../entity/implementation/soldier";
import { UnitRecruit } from "../unit-recruit";

export class SoldierRecruit extends UnitRecruit<Soldier> {
  hitbox: HitBox;
  speed: number;
  maxLife: number;
  constructor(soldier: Soldier) {
    super();
    this.hitbox = soldier.hitbox;
    this.maxLife = soldier.baseMaxLife;
    this.speed = soldier.baseSpeed;
  }
  type = "soldier" as const;
}
