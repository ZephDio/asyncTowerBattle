import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../shared/position";
import { BattleElfCastle } from "../battle/battle-elf-castle";
import { BattleGrid } from "../../grid/battle-grid";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { TokenHooks } from "../../shop/holder/holder";
import { FoodHooks } from "../../food/battle-food-economy";
import { RecruitCaster } from "../../../shared/traits/engine/cast";
import { HTBaseStats } from "../../stats/base-stats";

export const Castle = Subtrait([TRecruit, RecruitCaster, HTBaseStats], (base) => {
	abstract class ICastle extends base {
		abstract toAllied(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle;
		abstract toEnemy(grid: BattleGrid, onDeath: () => void, foodHooks: FoodHooks): BattleElfCastle;

		get position() {
			return this.cell;
		}
		moveRecruit(_hooks: TokenHooks, _position: GridPosition): undefined {
			throw new Error("Cannot move castle");
		}
	}
	return ICastle;
});

export type AnyCastle = ImplementsTrait<typeof Castle>;
