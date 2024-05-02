import { Derive } from "@ddd-ts/traits";
import { Stats } from "../../../stats/stats";
import { PathFinder } from "../../../battle/path-finder";
import { BattlePath } from "../../../path/battle/battle-path";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Berseker } from "../../recruit/implementation/berseker";
import { Status } from "../../../../shared/traits/engine/status";
import { TBattleUnit } from "../battle-unit";

export class BattleBerseker extends Derive(TBattleUnit) {
	pathFinder: PathFinder;
	constructor(
		recruit: Berseker,
		public position: GridPosition,
		public enemyPath: BattlePath,

		public hooks: BattleArmyHooks,
	) {
		super({
			imageDrawable: recruit,
			maxHealth: recruit.maxLife,
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			attackSpeed: recruit.attackSpeed,
			castSpeed: NaN,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	override tick() {
		super.tick();
		if (this.stats.health <= this.stats.maxHealth / 2) {
			this.addStatus(new Enraged({}));
		}
	}
}

export class Enraged extends Derive(Status) {
	key = "enraged";
	clock = 0;
	duration = Infinity;
	stats: Stats;
	didTrigger = false;
	tick() {
		if (this.didTrigger) return;
		this.stats.basePercentStat.movementSpeed += 30;
		this.stats.basePercentStat.attack += 25;
		this.didTrigger = true;
	}

	onRemove() {
		this.stats.basePercentStat.movementSpeed -= 30;
		this.stats.basePercentStat.attack -= 25;

		this.stats.removeStatus(this);
	}
}
