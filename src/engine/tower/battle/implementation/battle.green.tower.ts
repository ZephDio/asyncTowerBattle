import { Physic, PhysicEntity } from "../../../../shared/physic";
import { BattleUnit } from "../../../units/battle/entity-units-physic";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { GreenTowerRecruit } from "../../recruit/implementation/green-tower-recruit";
import { BattleTower, TowerAttackIntent } from "../battle-tower";

export class GreenBattleTower extends BattleTower<GreenTowerRecruit> {
	type = "green" as const;

	doesTargetMatchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 62 * 62;
	}

	attack(target: BattleUnit<UnitRecruit<Unit>>) {
		const projectile = this.entity.getProjectile(this.hooks, target, this.position, this.attackDamage);
		this.hooks.addProjectile(projectile, this);
		this.attackIntent = null;
	}

	tick() {
		if (this.attackIntent) {
			this.attackIntent.tick();
		}
		if (!this.attackIntent) {
			this.attackIntent = new TowerAttackIntent(this, () => {
				if (
					this.target &&
					this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
				) {
					this.attack(this.target);
					return;
				}
				const target = this.hooks.searchTarget(this, this.doesTargetMatchesRule);
				this.setTarget(target);
				if (this.target) {
					this.attack(this.target);
					return;
				}
			});
		}
	}
}
