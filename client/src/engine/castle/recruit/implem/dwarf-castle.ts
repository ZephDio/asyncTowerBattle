import { Derive } from "@ddd-ts/traits";
import { Cell } from "../../../../shared/position";
import { FoodHooks } from "../../../food/battle-food-economy";
import { BattleGrid } from "../../../grid/battle-grid";
import { Castle } from "../castle-recruit";
import { DwarfCastleBlueprint } from "../../blueprint/dwarf-castle-blueprint";
import { BattleDwarfCastle } from "../../battle/battle-dwarf-castle";
import { castleGeometry } from "../../castle-geometry";
import { BoardOrientation } from "../../../../shared/traits/engine/core/board-orientation";

export class DwarfCastle extends Derive(Castle) {
	constructor(
		castle: DwarfCastleBlueprint,
		public cell: Cell,
	) {
		super({
			imageDrawable: castle,
			hitboxHolder: castle,
			descriptor: castle,
			statsHolder: castle,
			tagHolder: castle,
			rarityHolder: castle,
			scienceHolder: castle,
		});
	}

	toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleDwarfCastle {
		const { position, doorPosition, spawnPosition } = castleGeometry(this.cell, BoardOrientation.Normal, grid.width);
		return new BattleDwarfCastle(
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

	toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleDwarfCastle {
		const cell = BattleGrid.flip(grid, this.cell);
		const { position, doorPosition, spawnPosition } = castleGeometry(cell, BoardOrientation.Mirrored, grid.width);
		return new BattleDwarfCastle(
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
