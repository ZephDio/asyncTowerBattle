import { Cell, GridPosition } from "../../../shared/position";
import { Derive } from "@ddd-ts/traits";
import { FoodHooks } from "../../food/battle-food-economy";
import { DwarfCastle } from "../recruit/implem/dwarf-castle";
import { TBattleCastle } from ".";
import { BoardOrientation } from "../../../shared/traits/engine/core/board-orientation";
import { TImageVariant } from "../../../shared/traits/render/image-variant";
import { CastleResources } from "../../../renderer/resources/castle.resources";

export class BattleDwarfCastle extends Derive(TBattleCastle, TImageVariant) {
	constructor(
		recruit: DwarfCastle,
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

	// The opponent's castle has its own image, drawn upright: its doors are on the other rows, and turning the left
	// castle by π would also turn its light to the right.
	getImageVariant() {
		if (this.orientation !== BoardOrientation.Mirrored) return null;
		return { image: CastleResources.dwarfBoardRight.image, theta: 0 };
	}

	produceFood() {
		this.foodHooks.addFood(5 / 32);
	}
}
