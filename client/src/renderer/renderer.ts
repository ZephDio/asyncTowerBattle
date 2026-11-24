import { ImplementsTrait } from "@ddd-ts/traits";
import { TRenderable } from "../shared/traits/render/renderable";
import { BattleGrid } from "../engine/grid/battle-grid";
import { ArmyGrid } from "../engine/grid/grid";
import { RetailGrid } from "../engine/grid/retail-grid";
import { Inventory } from "../engine/grid/inventory/unit-inventory";
import { GameWrapper } from "../engine/wrap";

export abstract class Renderer {
	abstract gameWrap: GameWrapper;
	abstract draw(): void;
}

export type RenderableState = {
	// Drawn right over the background, under every grid.
	backdrops?: ImplementsTrait<typeof TRenderable>[];
	renderables: ImplementsTrait<typeof TRenderable>[];
	grids: {
		grid: BattleGrid | ArmyGrid | RetailGrid | Inventory;
		drawables: ImplementsTrait<typeof TRenderable>[];
	}[];
};
