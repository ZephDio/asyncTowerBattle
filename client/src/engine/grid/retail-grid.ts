import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { Cell, ScreenPosition } from "../../shared/position";
import { Buyable } from "../shop/retail/buyable";
import { TRenderable } from "../../shared/traits/render/renderable";
import { ArmyGrid } from "./grid";
import { drawFence } from "../../shared/traits/render/fence";
import { Plot, drawConstructionSites } from "../../shared/traits/render/construction-site";

// Cells trimmed off the grid's sides to get the fenced field (negative: the field reaches past the grid). It fills the
// space between the shop sign and the start button, above the army grid; the bottom row's prices stand clear of the
// front fence and a two-cell-tall offer in the top row clear of the back fence.
const FIELD_TRIM = { left: 0.06, right: 0.06, top: -0.02, bottom: -0.24 };
// The price sign of each offer, in cells around its slot's center (x right, y down): what a building site must not
// spread over.
const SIGN = { halfWidth: 0.55, top: 0.38, bottom: 0.95 };
// Art pixels per cell of the fence and the building sites, as on the grass.
const ART_PIXELS_PER_CELL = 48;

export class RetailGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	override hoverEffect: HoverEffect[] | null;
	tiles: Map<string, Buyable> = new Map();
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		// The cells where the shop lays its offers: each one keeps its building site, even once sold.
		public slots: Cell[] = [],
		screenPosition = new ScreenPosition({ x: 38.75, y: 46.5 }),
		width: number = 9,
		height: number = 5,
		cellSize: number = 4.5,
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	// The footprint of the offer laid on each slot, kept while it is held and once it is sold, until the next draw.
	private siteShapes = new Map<string, Cell[]>();

	override setElement(buyable: Buyable) {
		super.setElement(buyable);
		const cells = buyable.entity.gridShape.getVectorialCells(buyable.entity.orientation);
		this.siteShapes.set(ArmyGrid.posToString(buyable.cell), cells);
	}

	clearOffers() {
		this.tiles.clear();
		this.siteShapes.clear();
	}

	getBuyables() {
		return [...this.tiles.values()];
	}

	// A building site on each slot, in the footprint of the offer laid there, drawn like it centered on its cell. A slot
	// that got no offer has a one-cell site.
	plots(position: { x: number; y: number }, tileSize: number): Plot[] {
		return this.slots.map((slot) => {
			const cells = this.siteShapes.get(ArmyGrid.posToString(slot)) ?? [new Cell({ x: 0, y: 0 })];
			const center = { x: position.x + (slot.x + 0.5) * tileSize, y: position.y - (slot.y + 0.5) * tileSize };
			const sign = this.tiles.get(ArmyGrid.posToString(slot))
				? {
						left: center.x - SIGN.halfWidth * tileSize,
						right: center.x + SIGN.halfWidth * tileSize,
						top: center.y + SIGN.top * tileSize,
						bottom: center.y + SIGN.bottom * tileSize,
					}
				: undefined;
			return { cells, center, sign };
		});
	}

	// A fenced field of grass, like the army grid's, with a building site under each offer.
	override render(context: CanvasRenderingContext2D): void {
		context.globalAlpha = 1;
		const position = this.getCanvasPosition(context, this.position);
		const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
		// The field is smaller than the grid: the padding shrinks, the cells (so the item spacing) stay.
		// The canvas position is the bottom left corner: the area goes up from it
		const left = position.x + FIELD_TRIM.left * tileSize;
		const top = position.y - (this.height - FIELD_TRIM.top) * tileSize;
		const width = (this.width - FIELD_TRIM.left - FIELD_TRIM.right) * tileSize;
		const height = (this.height - FIELD_TRIM.top - FIELD_TRIM.bottom) * tileSize;

		context.save();
		context.beginPath();
		context.rect(left, top, width, height);
		context.clip();
		context.fillStyle = "#6C6";
		context.fillRect(left, top, width, height);
		this.drawGrass(context, position, tileSize);
		drawConstructionSites(context, this.plots(position, tileSize), tileSize, {
			left,
			top,
			right: left + width,
			bottom: top + height,
		});
		context.restore();
		drawFence(context, left, top, width, height, tileSize / ART_PIXELS_PER_CELL);
	}
}
