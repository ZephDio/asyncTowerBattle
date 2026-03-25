import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { FoodHooks } from "../../food/battle-food-economy";
import { ElfCastle } from "../recruit/implem/elf-castle";
import { TBattleCastle } from ".";

export class BattleElfCastle extends Derive(TBattleCastle) {
	constructor(
		recruit: ElfCastle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		orientation: number,
		public foodHooks: FoodHooks,
	) {
		super({
			imageDrawable: recruit,
			hitboxHolder: recruit,
			casterRecruit: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			castSpeed: recruit.stats.castSpeed,
			attackSpeed: recruit.stats.attackSpeed,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => this.onDeath(),
			descriptor: recruit,
			tagHolder: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.setOrientation(orientation);
	}

	produceFood() {
		this.foodHooks.addFood(4 / 32);
	}
}
