import { Derive } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyBattleUnit } from "../../../../units/battle/battle-unit";
import { FrostTower } from "../../recruit/implementation/frost-tower";
import { BattleTower } from "../battle-tower";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
export class FrostBattleTower extends Derive(BattleTower) {
	constructor(
		private readonly recruit: FrostTower,
		private readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		orientation: BoardOrientation,
	) {
		super({
			recruit,
			orientation,
			casterRecruit: recruit,
			hitboxHolder: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			range: recruit.stats.range,
			onDeath: () => {},
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
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

	sucessAttack() {}

	target = null as null | AnyBattleUnit;
	private doesTargetMatchesRule(enemyUnit: AnyBattleUnit) {
		return enemyUnit.isAlive() && this.isInTargetZone(this.hooks.gridHooks.getCell(enemyUnit.position));
	}
	setTarget(enemyUnit: AnyBattleUnit | null) {
		this.target = enemyUnit;
	}

	onCastResolve() {
		if (this.target && this.doesTargetMatchesRule(this.target)) {
			this.attack(this.target);
			return;
		}
		const target = this.hooks.searchTarget(this.position, this.doesTargetMatchesRule.bind(this));
		this.setTarget(target);
		if (this.target) {
			this.attack(this.target);
			return;
		}
	}
}
