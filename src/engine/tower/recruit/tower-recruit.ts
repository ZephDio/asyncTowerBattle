import { HitBox } from "../../../shared/hitboxes";
import { getDistance, Position } from "../../../shared/position";
import { PhysicEntity, Recruit } from "../../../shared/physic";
import { BattleProjectile } from "../../projectile/battle/battle-projectile";
import { Projectile } from "../../projectile/entity/projectile";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleTower } from "../battle/battle-tower";
import { Tower } from "../entity/tower";

export abstract class TowerRecruit<T extends Tower> implements Recruit {
  abstract type: T["type"];
  abstract hitbox: HitBox;
  abstract attackSpeed: number;
  abstract attackDamage: number;
  abstract position: Position;
  abstract tower: T;

  doesTargetMatchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return enemyUnit.isAlive() && getDistance(enemyUnit.position, this.position) < 62;
  }

  abstract getProjectile(
    onResolve: Function,
    target: PhysicEntity<Recruit>,
    position: Position,
    damage: number
  ): BattleProjectile<Projectile>;

  abstract toPhysic(addProjectile: Function, removeProjectile: Function): BattleTower<TowerRecruit<T>>;
  abstract clone(): TowerRecruit<T>;
}
