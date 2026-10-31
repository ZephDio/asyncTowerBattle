import { Derive } from "@ddd-ts/traits";
import { TBattleUnit } from "../battle-unit";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { Brewmaster } from "../../recruit/implementation/brewmaster";
import { GridPosition } from "../../../../shared/position";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { BattleArmyHooks } from "../../../army/battle/battle-army";

export class BattleBrewmaster extends Derive(TBattleUnit, Caster) {
	pathFinder: PathFinder;

	constructor(
		recruit: Brewmaster,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			range: recruit.stats.range,
			attack: recruit.stats.damage,
			attackSpeed: recruit.stats.attackSpeed,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	drink() {
		const heal = this.stats.maxHealth * 0.15;
		this.stats.heal(heal);
		this.finishCast();
	}

	casts() {
		this.castInProgress = new Cast(this, this.drink.bind(this));
	}

	override tick(): void {
		super.tick();
		this.tickCast();
	}
}
