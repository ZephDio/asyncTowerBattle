import { Derive } from "@ddd-ts/traits";
import { GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { GoGoat } from "../../recruit/implementation/go-goat";
import { PathFinder } from "../../../battle/path-finder";
import { TBattleUnit } from "../battle-unit";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

// Hitting the enemy castle gives its army one movement speed buff.
export class BattleGoGoat extends Derive(TBattleUnit) {
	override idleSheet = UnitResources.goGoatSheet;
	pathFinder: PathFinder;

	constructor(
		recruit: GoGoat,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
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
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	override attackCastle() {
		this.hooks.alliedArmyBuffHooks.addUnitBuff("movement-speed");
		super.attackCastle();
	}
}
