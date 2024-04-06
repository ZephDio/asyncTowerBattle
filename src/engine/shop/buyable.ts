import { Subtrait, Trait } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { TokenHooks } from "./shop";
import { TGCollider, THitbox } from "../../shared/hitboxes";
import { GridElement } from "../grid/grid";
import { TDrawable } from "../../shared/traits/tdrawable";

export const TBuyable = (price: number) =>
	Subtrait([TGCollider, TDrawable], (base) => {
		abstract class IBuyable extends base {
			price: number = price;

			buy(hooks: TokenHooks, position: Position) {
				const grid = hooks.armyHooks.getArmyGrid();
				const cell = grid.realPositionToGrid(position);
				if (!cell) {
					throw new Error("Invalid position");
				}

				if (!hooks.armyHooks.isValidDestinationCell(cell)) {
					throw new Error("Invalid position");
				}
				const gold = hooks.economyHooks.getEconomy().gold;
				if (gold < this.price) {
					throw new Error("Not enough money");
				}
				hooks.shopHooks.buy(this, cell);
			}
		}
		return IBuyable;
	});

export const TTowerBuyable = Subtrait([TBuyable(0)], (base) => {
	abstract class ITowerBuyable extends base {}
	return ITowerBuyable;
});

export const TUnitBuyable = Subtrait([TBuyable(0)], (base) => {
	abstract class IUnitBuyable extends base {
		override buy(hooks: TokenHooks, position: Position) {}
	}
	return IUnitBuyable;
});

export const TBarrackBuyable = Subtrait([TBuyable(0)], (base) => {
	abstract class IBarrackBuyable extends base {}
	return IBarrackBuyable;
});
