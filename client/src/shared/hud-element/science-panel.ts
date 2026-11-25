import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Army } from "../../engine/army/army";
import { ScienceGrid } from "../../engine/grid/science-grid";
import { blueprintsRequiring } from "../../engine/shop/retail/retail-filler";
import { Cell, GridPosition, ScreenPosition } from "../position";
import { Science, grantedSciencesOf } from "../traits/engine/science";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { TDescriptor } from "../traits/render/huds/item-descriptor";
import { HudTooltip } from "./battle/army-resume/hud-tooltip";

export const SCIENCE_NAMES: Record<Science, string> = {
	[Science.Elf]: "Elf",
	[Science.Dwarf]: "Dwarf",
};

// Screen units. The scroll covers the left of the shop, up to the reserve, which stays visible with the ribbon and
// the descriptor.
const CENTER = new ScreenPosition({ x: 36.5, y: 31.3 });
const SIZE = { width: 71, height: 59 };
// The pieces stand on an invisible grid under the title, every GAP cells so their pattern and target cells show.
const GRID = { width: 13, height: 7, cellSize: 4.5, center: new ScreenPosition({ x: 36.5, y: 26 }) };
const GAP = 4;
const PER_ROW = 3;
const INK = "#161c2e";

const nameOf = (element: object) =>
	implementsTrait(element, TDescriptor) ? element.description.name : element.constructor.name;

// A science's scroll, opened from its seal on the ribbon: what grants it in the army, and every piece it unlocks in
// the shop, laid on an invisible grid where hovering a piece describes it and shows its pattern and target cells.
export class SciencePanel extends Derive(TRenderable, TDrawable) {
	drawPriority = DrawPriority.Menu;
	position = CENTER;
	readonly grid: ScienceGrid;
	private granters: string[];

	constructor(
		readonly science: Science,
		army: Army,
	) {
		super({});
		this.grid = new ScienceGrid(GRID.width, GRID.height, GRID.center.clone(), GRID.cellSize);
		const blueprints = blueprintsRequiring(science);
		const rows = Math.ceil(blueprints.length / PER_ROW);
		blueprints.forEach((blueprint, index) => {
			const row = Math.floor(index / PER_ROW);
			const inRow = Math.min(PER_ROW, blueprints.length - row * PER_ROW);
			const cell = new Cell({
				x: Math.floor(GRID.width / 2) + Math.round((index % PER_ROW) - (inRow - 1) / 2) * GAP,
				y: Math.floor(GRID.height / 2) + Math.round((rows - 1) / 2 - row) * GAP,
			});
			this.grid.setElement(blueprint.toRecruit(cell));
		});
		this.granters = army.scienceGranters.filter((element) => grantedSciencesOf(element).includes(science)).map(nameOf);
	}

	contains(point: ScreenPosition) {
		return Math.abs(point.x - CENTER.x) <= SIZE.width / 2 && Math.abs(point.y - CENTER.y) <= SIZE.height / 2;
	}

	// The piece under `point`, if any.
	elementAt(point: ScreenPosition) {
		const cell = this.grid.gridPositionToCell(this.grid.screenToGridPosition(point));
		return cell ? this.grid.getElement(cell) : undefined;
	}

	clearHover() {
		this.grid.clearSynergiesTiles();
		this.grid.setOveredTile(null);
	}

	draw(context: CanvasRenderingContext2D): void {
		const unit = this.getCanvasSize(context, 1, 1).width;
		const p = Math.max(2, Math.round(unit * 0.16));
		const columns = Math.round((SIZE.width * unit) / p);
		const rows = Math.round((SIZE.height * unit) / p);
		const center = this.getCanvasPosition(context, CENTER);
		const left = Math.round(center.x - (columns * p) / 2);
		const top = Math.round(center.y - (rows * p) / 2);
		context.save();
		context.globalAlpha = 1;
		HudTooltip.drawScroll(context, left, top, columns, rows, p);
		context.fillStyle = INK;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `${3 * unit}px title`;
		context.fillText(`${SCIENCE_NAMES[this.science]} science`, center.x, top + 6 * unit);
		context.font = `${1.6 * unit}px text`;
		context.fillText(`Granted by ${this.granters.join(", ")}`, center.x, top + 9.5 * unit);
		if (this.grid.getElements().length === 0) {
			context.fillText("It unlocks nothing yet", center.x, center.y + 2 * unit);
		}
		context.restore();
		this.drawGrid(context);
	}

	// The pieces and their hover effects, ordered as the renderer orders a grid's drawables.
	private drawGrid(context: CanvasRenderingContext2D) {
		const height = (drawable: ImplementsTrait<typeof TRenderable>) => {
			const position = drawable.position;
			return position instanceof Cell ? this.grid.cellToGrid(position).y : (position as GridPosition).y;
		};
		this.grid
			.getDrawables()
			.sort((a, b) => height(b) - height(a))
			.sort((a, b) => a.drawPriority - b.drawPriority)
			.forEach((drawable) => drawable.render(context, this.grid));
	}
}
