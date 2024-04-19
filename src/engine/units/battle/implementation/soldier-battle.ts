import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { Soldier } from "../../recruit/implementation/soldier-recruit";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";

export class BattleSoldier extends Derive(TBattleUnit) {
	pathFinder: PathFinder;

	constructor(
		recruit: Soldier,
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
	canMove() {
		if (this.stats.status.has("stunned")) {
			return false;
		}
		return true;
	}
}
