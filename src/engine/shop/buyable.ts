// import { Subtrait, Trait } from "@ddd-ts/traits";
// import { Position } from "../../shared/position";
// import { TokenHooks } from "./shop";

// export const TBuyable = (price: number) =>
// 	Trait((base) => {
// 		abstract class IBuyable extends base {
// 			buyValue: number = price;

// 			abstract buy(): void;
// 		}
// 		return IBuyable;
// 	});

// export const TTowerBuyable = Subtrait([TBuyable(0)], (base) => {
// 	class ITowerBuyable extends base {
// 		buy(hooks: TokenHooks, position: Position) {
// 			const grid = hooks.armyHooks.getArmyGrid()
// 			const cell = grid.realPositionToGrid(position);
// 			if(!cell) {
// 				throw new Error("Invalid position");
// 			}
// 			hooks.armyHooks.isValidDestinationCell(position).
// 		}
// 	}
// 	return ITowerBuyable;
// });
