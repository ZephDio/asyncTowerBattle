import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { GreenTowerRecruit } from "../../recruit/implementation/green-tower-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { Caster } from "../../../../shared/traits/cast";
import { AnyBattleUnit } from "../../../units/recruit/unit-recruit";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";

export class GreenBattleTower extends Derive(TRenderable, Caster, HTImageDrawable) {
  target = null as null | AnyBattleUnit;
  public attackDamage: number;
  constructor(
    private readonly recruit: GreenTowerRecruit,
    private readonly hooks: BattleArmyHooks,
    public readonly position: Position,
    public readonly cell: Cell
  ) {
    super({ imageDrawable: recruit });
    this.draw = this.recruit.draw;
    this.attackDamage = recruit.attackDamage;
    this.castSpeed = recruit.attackSpeed;
  }

  takeDamage(_damage: number): void {
    return;
  }

  private attack(target: AnyBattleUnit) {
    const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.attackDamage);
    this.hooks.addProjectile(projectile, this);
    this.cast = null;
  }
  private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
    return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
  }
  setTarget(enemyUnit: AnyBattleUnit | null) {
    this.target = enemyUnit;
  }

  isAlive() {
    return true;
  }

  onCastResolve(): void {
    if (this.target && this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))) {
      this.attack(this.target);
      return;
    }
    const target = this.hooks.searchTarget(this, this.doesTargetMatchesRule);
    this.setTarget(target);
    if (this.target) {
      this.attack(this.target);
      return;
    }
  }

  tick() {
    this.tickCast();
  }
}
// 	type = "green" as const;

// 	doesTargetMatchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>, distanceSqrd: number) {
// 		return enemyUnit.isAlive() && distanceSqrd < 62 * 62;
// 	}

// 	attack(target: BattleUnit<UnitRecruit<Unit>>) {
// 		const projectile = this.entity.getProjectile(this.hooks, target, this.position, this.attackDamage);
// 		this.hooks.addProjectile(projectile, this);
// 		this.attackIntent = null;
// 	}

// 	tick() {
// 		if (this.attackIntent) {
// 			this.attackIntent.tick();
// 		}
// 		if (!this.attackIntent) {
// 			this.attackIntent = new TowerAttackIntent(this, () => {
// 				if (
// 					this.target &&
// 					this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
// 				) {
// 					this.attack(this.target);
// 					return;
// 				}
// 				const target = this.hooks.searchTarget(this, this.doesTargetMatchesRule);
// 				this.setTarget(target);
// 				if (this.target) {
// 					this.attack(this.target);
// 					return;
// 				}
// 			});
// 		}
// 	}
// }
