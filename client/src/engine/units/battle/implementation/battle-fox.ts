import { Derive } from "@ddd-ts/traits";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { Fox } from "../../recruit/implementation/fox";
import { GridPosition } from "../../../../shared/position";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

export class BattleFox extends Derive(TBattleUnit, Caster) {
	override idleSheet = UnitResources.foxSheet;
	foodConsume: number = 2;
	pathFinder: PathFinder;
	constructor(
		recruit: Fox,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	eatOpponentFood() {
		this.hooks.enemyFoodHooks.removeFood((this.stats.basePercentStat.attack / 100) * this.foodConsume);
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.eatOpponentFood.bind(this));
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
