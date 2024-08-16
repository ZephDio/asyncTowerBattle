import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Dragon } from "../../recruit/implementation/dragon";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";

export class BattleDragon extends Derive(TBattleUnit) {
	pathFinder: PathFinder;

	constructor(
		recruit: Dragon,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		const golds = hooks.alliedEconomyHooks.getEconomy().amount;
		super({
			imageDrawable: recruit,
			maxHealth: recruit.maxLife + Math.floor(golds / 5),
			attack: recruit.attackDamage,
			movementSpeed: recruit.speed,
			attackSpeed: recruit.attackSpeed,
			castSpeed: NaN,
			foodCost: recruit.foodCost,
			onDeath: () => this.hooks.removeUnit(this),
			hitboxHolder: recruit,
			descriptor: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}
}
