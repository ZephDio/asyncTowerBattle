import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { FoodHooks } from "../../food/battle-food-economy";
import { DwarfCastle } from "../recruit/implem/dwarf-castle";
import { TBattleCastle } from ".";
import { BoardOrientation } from "../../../shared/traits/engine/core/board-orientation";

export class BattleDwarfCastle extends Derive(TBattleCastle) {
	constructor(
		recruit: DwarfCastle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		orientation: BoardOrientation,
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
			attackSpeed: recruit.stats.damage,
			foodCost: recruit.stats.foodConsumptionOnCast,
			range: recruit.stats.range,
			onDeath: () => this.onDeath(),
			descriptor: recruit,
			tagHolder: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.orientation = orientation;
	}

	produceFood() {
		this.foodHooks.addFood(3.5 / 32);
	}
}
