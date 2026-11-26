import { drawShopPanel } from "../../shared/traits/render/shop-panel";
import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { ScreenPosition } from "../../shared/position";
import { Buyable } from "../shop/retail/buyable";
import { TRenderable } from "../../shared/traits/render/renderable";

// Cells trimmed off each side of the drawn panel, horizontally and vertically.
const PANEL_TRIM_X = 0.5;
const PANEL_TRIM_Y = 0.3;
// Prices hang below the offers: shift the frame down this many cells for optical centering.
const PANEL_DROP_Y = 0.2;

export class RetailGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	override hoverEffect: HoverEffect[] | null;
	tiles: Map<string, Buyable> = new Map();
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		screenPosition = new ScreenPosition({ x: 38.85, y: 48.3 }),
		width: number = 9,
		height: number = 5,
		cellSize: number = 4.5,
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	getBuyables() {
		return [...this.tiles.values()];
	}

	override render(context: CanvasRenderingContext2D): void {
		context.globalAlpha = 1;
		const position = this.getCanvasPosition(context, this.position);
		const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
		// The panel is drawn smaller than the grid: the padding shrinks, the cells (so the item spacing) stay.
		const padX = tileSize * PANEL_TRIM_X;
		const padY = tileSize * PANEL_TRIM_Y;
		const width = this.width * tileSize - 2 * padX;
		const height = this.height * tileSize - 2 * padY;
		// The canvas position is the bottom left corner: the area goes up from it
		const left = position.x + padX;
		const top = position.y - this.height * tileSize + padY + tileSize * PANEL_DROP_Y;
		drawShopPanel(context, left, top, width, height, tileSize);
	}
}
