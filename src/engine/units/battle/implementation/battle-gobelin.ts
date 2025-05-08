import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { GobelinBlueprint } from "../../blueprint/implementation/gobelin-blueprint";

export class BattleGobelin extends Derive(TBattleUnit) {
	pathFinder: PathFinder;

	constructor(
		recruit: GobelinBlueprint,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		console.log({ recruit });
		super({
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
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}
}
