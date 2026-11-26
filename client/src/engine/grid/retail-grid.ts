import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { Cell, GridPosition, ScreenPosition } from "../../shared/position";
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
// The most room an offer takes around its slot's center, in cells, so it stays clear of the other slots, their price
// signs and the fence. An offer whose footprint is bigger is drawn smaller, with its site, to fit SHRUNK_BOX: a little
// less, so two shrunk neighbors keep some grass between them.
const OFFER_BOX = { width: 2, height: 2 };
const SHRUNK_BOX = { width: 1.8, height: 1.8 };

// The bounding box of a footprint, in cells.
function extent(cells: Cell[]) {
	const xs = cells.map((cell) => cell.x);
	const ys = cells.map((cell) => cell.y);
	return { columns: Math.max(...xs) - Math.min(...xs) + 1, rows: Math.max(...ys) - Math.min(...ys) + 1 };
}

// How much an offer with this footprint is shrunk to fit its slot: 1 when it already fits.
export function offerScale(cells: Cell[]) {
	const { columns, rows } = extent(cells);
	if (columns <= OFFER_BOX.width && rows <= OFFER_BOX.height) return 1;
	return Math.min(SHRUNK_BOX.width / columns, SHRUNK_BOX.height / rows);
}

type Site = { cells: Cell[]; scale: number };

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

	// The footprint of the offer laid on each slot and its scale, kept while it is held and once it is sold, until the
	// next draw.
	private sites = new Map<string, Site>();

	// An offer that fits takes the cells of its footprint, as on the army grid. A shrunk one only takes its slot's cell
	// and is found by its drawn box (offerAt), since its footprint would reach over the other slots.
	override setElement(buyable: Buyable) {
		const cells = buyable.entity.gridShape.getVectorialCells(buyable.entity.orientation);
		const scale = offerScale(cells);
		buyable.sizeScale = scale;
		if (scale < 1) this.tiles.set(ArmyGrid.posToString(buyable.cell), buyable);
		else super.setElement(buyable);
		this.sites.set(ArmyGrid.posToString(buyable.cell), { cells, scale });
	}

	// The shrunk offer drawn at this grid position, its footprint's box or its image, whichever is bigger.
	offerAt(position: GridPosition): Buyable | undefined {
		for (const buyable of new Set(this.tiles.values())) {
			if (buyable.sizeScale >= 1) continue;
			const { columns, rows } = extent(buyable.entity.gridShape.getVectorialCells(buyable.entity.orientation));
			const scale = buyable.sizeScale;
			const halfWidth = (Math.max(columns * STANDARD_CELL_SIZE, buyable.drawable.size.width) * scale) / 2;
			const halfHeight = (Math.max(rows * STANDARD_CELL_SIZE, buyable.drawable.size.height) * scale) / 2;
			const center = this.cellToGrid(buyable.cell);
			if (Math.abs(position.x - center.x) <= halfWidth && Math.abs(position.y - center.y) <= halfHeight) {
				return buyable;
			}
		}
		return undefined;
	}

	clearOffers() {
		this.tiles.clear();
		this.sites.clear();
	}

	getBuyables() {
		return [...this.tiles.values()];
	}

	// A building site on each slot, in the footprint of the offer laid there at the offer's scale, drawn like it
	// centered on its cell. A slot that got no offer has a one-cell site.
	plots(position: { x: number; y: number }, tileSize: number): Plot[] {
		return this.slots.map((slot) => {
			const { cells, scale } = this.sites.get(ArmyGrid.posToString(slot)) ?? {
				cells: [new Cell({ x: 0, y: 0 })],
				scale: 1,
			};
			const center = { x: position.x + (slot.x + 0.5) * tileSize, y: position.y - (slot.y + 0.5) * tileSize };
			const sign = this.tiles.get(ArmyGrid.posToString(slot))
				? {
						left: center.x - SIGN.halfWidth * tileSize,
						right: center.x + SIGN.halfWidth * tileSize,
						top: center.y + SIGN.top * tileSize,
						bottom: center.y + SIGN.bottom * tileSize,
					}
				: undefined;
			return { cells, center, sign, scale };
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
