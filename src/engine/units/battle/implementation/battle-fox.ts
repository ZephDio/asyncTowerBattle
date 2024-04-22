import { Derive } from "@ddd-ts/traits";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { Fox } from "../../recruit/implementation/fox-recruit";
import { GridPosition } from "../../../../shared/position";
import { BattlePath } from "../../../path/battle/battle-path";
import { BattleArmyHooks } from "../../../army/battle/battle-army";

export class BattleFox extends Derive(TBattleUnit, Caster) {
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
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			attackSpeed: recruit.attackSpeed,
			castSpeed: recruit.castSpeed,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	eatOpponentFood() {
		this.hooks.enemyFoodHooks.removeFood(this.stats.attack * 2);
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.eatOpponentFood.bind(this), 96);
	}

	override tick() {
		super.tick();
		this.tickCast();
	}
}
