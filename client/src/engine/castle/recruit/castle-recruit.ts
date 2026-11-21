import { DWARF_CASTLE_LAYOUT } from "../../grid/grid-scale";
import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { TokenHooks } from "../../shop/holder/holder";
import { FoodHooks } from "../../food/battle-food-economy";
import { RecruitCaster } from "../../../shared/traits/engine/cast";
import { HTBaseStats } from "../../stats/base-stats";
import { AnyBattleCastle } from "../battle";
import { BoardOrientation } from "../../../shared/traits/engine/core/board-orientation";
import { castleGeometry } from "../castle-geometry";

export const Castle = Subtrait([TRecruit, RecruitCaster, HTBaseStats], (base) => {
	abstract class ICastle extends base {
		layout = DWARF_CASTLE_LAYOUT;
		abstract toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): AnyBattleCastle;
		abstract toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): AnyBattleCastle;

		// Where the castle is drawn: the centre of its off-board block, see castle-geometry.ts. `cell` is its anchor
		// cell, the top left cell of the board where the path ends.
		get position() {
			return castleGeometry(this.cell, BoardOrientation.Normal, 0, this.layout).position;
		}
		moveRecruit(_hooks: TokenHooks, _position: GridPosition): undefined {
			throw new Error("Cannot move castle");
		}
	}
	return ICastle;
});

export type AnyCastle = ImplementsTrait<typeof Castle>;
