import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { BlueTowerRecruit } from "../../recruit/implementation/blue-tower-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, Position } from "../../../../shared/position";
import { HTImageDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Caster } from "../../../../shared/traits/cast";
import { AnyBattleUnit } from "../../../units/recruit/unit-recruit";
import { HTDamageDealer } from "../../../../shared/traits/damage-dealer";
export class BlueBattleTower extends Derive(
  HTDamageDealer,
  TRenderable,
  Caster,
  HTImageDrawable
) {
  constructor(
    private readonly recruit: BlueTowerRecruit,
    private readonly hooks: BattleArmyHooks,
    public readonly position: Position,
    public readonly cell: Cell
  ) {
    super({ imageDrawable: recruit, damageDealer: recruit });
    this.castSpeed = recruit.attackSpeed;
  }

  private attack(target: AnyBattleUnit) {
    const projectile = this.recruit.getProjectile(this.hooks, target, this.position, this.attackDamage);
    this.hooks.addProjectile(projectile, this);
  }

  private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
    return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
  }
  target = null as null | AnyBattleUnit;
  setTarget(enemyUnit: AnyBattleUnit | null) {
    this.target = enemyUnit;
  }

  onCastResolve() {
    if (this.target && this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))) {
      this.attack(this.target);
      this.cast = null;
      return;
    }
    const target = this.hooks.searchTarget(this, this.doesTargetMatchesRule);
    this.setTarget(target);
    if (this.target) {
      this.attack(this.target);
      this.cast = null;
      return;
    }
  }

  tick() {
    super.tickCast();
  }
}
