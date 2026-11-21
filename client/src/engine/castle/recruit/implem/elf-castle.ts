import { Derive } from "@ddd-ts/traits";
import { ElfCastleBlueprint } from "../../blueprint/elf-castle-blueprint";
import { Cell } from "../../../../shared/position";
import { FoodHooks } from "../../../food/battle-food-economy";
import { BattleElfCastle } from "../../battle/battle-elf-castle";
import { BattleGrid } from "../../../grid/battle-grid";
import { Castle } from "../castle-recruit";
import { castleGeometry } from "../../castle-geometry";
import { BoardOrientation } from "../../../../shared/traits/engine/core/board-orientation";

export class ElfCastle extends Derive(Castle) {
	constructor(
		castle: ElfCastleBlueprint,
		public cell: Cell,
	) {
		super({
			imageDrawable: castle,
			hitboxHolder: castle,
			descriptor: castle,
			statsHolder: castle,
			tagHolder: castle,
			rarityHolder: castle,
		});
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const { position, doorPosition, spawnPosition } = castleGeometry(this.cell, BoardOrientation.Normal, grid.width);
		return new BattleElfCastle(
			this,
			onDeath,
			this.cell.clone(),
			position,
			doorPosition,
			spawnPosition,
			BoardOrientation.Normal,
			foodHooks,
		);
	}

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const { position, doorPosition, spawnPosition } = castleGeometry(cell, BoardOrientation.Mirrored, grid.width);
		return new BattleElfCastle(
			this,
			onDeath,
			cell,
			position,
			doorPosition,
			spawnPosition,
			BoardOrientation.Mirrored,
			foodHooks,
		);
	}
}
