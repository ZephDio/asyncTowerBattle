import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/entity/path";
import { BattleSoldier } from "../../battle/implementation/soldier-battle";
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
    this.attackSpeed = soldier.attackSpeed;
    this.attackDamage = soldier.attackDamage;
  }
  type = "soldier" as const;

  toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks) {
    return new BattleSoldier(this, position, path, hooks);
  }
}
