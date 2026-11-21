import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { FoodHooks } from "../../food/battle-food-economy";
import { ElfCastle } from "../recruit/implem/elf-castle";
import { TBattleCastle } from ".";
import { BoardOrientation } from "../../../shared/traits/engine/core/board-orientation";

export class BattleElfCastle extends Derive(TBattleCastle) {
	constructor(
		recruit: ElfCastle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		public doorPosition: GridPosition,
		public spawnPosition: GridPosition,
		orientation: BoardOrientation,
		public foodHooks: FoodHooks,
	) {
		super({
			imageDrawable: recruit,
			hitboxHolder: recruit,
			casterRecruit: recruit,
			maxHealth: recruit.stats.health,
			castleDamage: recruit.stats.castleDamage,
			projectileDamage: recruit.stats.projectileDamage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => this.onDeath(),
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.orientation = orientation;
	}

	produceFood() {
		this.foodHooks.addFood(4 / 32);
	}
}
