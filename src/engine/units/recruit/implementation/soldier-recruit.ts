import { HitBox } from "../../../../shared/hitboxes";
import { Soldier } from "../../entity/implementation/soldier";
import { UnitRecruit } from "../unit-recruit";

export class SoldierRecruit extends UnitRecruit<Soldier> {
  hitbox: HitBox;
  speed: number;
  maxLife: number;
  attackSpeed: number;
  attackDamage: number;
  constructor(soldier: Soldier) {
    super();
    this.hitbox = soldier.hitbox;
    this.maxLife = soldier.baseMaxLife;
    this.speed = soldier.baseSpeed;
    this.attackSpeed = soldier.attackSpeed
    this.attackDamage = soldier.attackDamage
  }
  type = "soldier" as const;
}
