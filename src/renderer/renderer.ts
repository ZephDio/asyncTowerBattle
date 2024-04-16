import { ImplementsTrait } from "@ddd-ts/traits";
import { Game } from "../engine/game";
import { TRenderable } from "../shared/traits/render/renderable";
import { BattleGrid } from "../engine/grid/battle-grid";
import { ArmyGrid } from "../engine/grid/grid";
import { RetailGrid } from "../engine/grid/retail-grid";
import { Inventory } from "../engine/grid/inventory/unit-inventory";

export abstract class Renderer {
	abstract game: Game;
	abstract draw(): void;
}

export type RenderableState = {
	renderables: ImplementsTrait<typeof TRenderable>[];
	grids: {
		grid: BattleGrid | ArmyGrid | RetailGrid | Inventory;
		drawables: ImplementsTrait<typeof TRenderable>[];
	}[];
};
