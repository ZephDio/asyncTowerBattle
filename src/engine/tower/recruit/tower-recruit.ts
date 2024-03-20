import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { PhysicEntity, Recruit } from "../../physic/physic";
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

  abstract matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>): boolean;
  abstract toPhysic(): BattleTower<TowerRecruit<T>>;
  abstract clone(): TowerRecruit<T>;
}
