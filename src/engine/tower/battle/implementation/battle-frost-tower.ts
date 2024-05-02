import { Derive } from "@ddd-ts/traits";
import { Physic } from "../../../../shared/physic";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { AnyBattleUnit } from "../../../units/battle/battle-unit";
import { FrostTower } from "../../recruit/implementation/frost-tower";
import { BattleTower } from "../battle-tower";
export class FrostBattleTower extends Derive(
	BattleTower
) {
	constructor(
		private readonly recruit: FrostTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: number
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			hitboxHolder: recruit,
			imageDrawable: recruit,
			maxHealth: NaN,
			attack: recruit.attackDamage,
			movementSpeed: NaN,
			foodCost: recruit.foodCost,
			castSpeed: recruit.attackSpeed,
			attackSpeed: NaN,
			onDeath: () => {},
			descriptor: recruit,
		});
	}

	private attack(target: AnyBattleUnit) {
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			const IceSpikeSpawnLocation = new GridPosition({ x: target.position.x, y: target.position.y + 9 });
			const projectile = this.recruit.getProjectile(this.hooks, target, IceSpikeSpawnLocation, this.stats.attack);
			this.hooks.addProjectile(projectile, this);
		}
		this.finishCast(sucess);
	}

	sucessAttack(){

	}
	
	target = null as null | AnyBattleUnit;
	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit, distanceSqrd: number) {
		return enemyUnit.isAlive() && distanceSqrd < 20 * 20;
	}
	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve() {
		if (
			this.target &&
			this.doesTargetMatchesRule(this.target, Physic.getDistanceSqrd(this.position, this.target.position))
		) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule);
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}

}
