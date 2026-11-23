import { ArmyGrid, armyGridCenter } from "../../engine/grid/grid";

export const OUTLINE = "#1d1d1c";
export const TEXT = "#fff4dc";
const PANEL_FILL = "#3b2a22";
const PANEL_RIM = "#c8955a";

// How far the ArmyHud hangs below the grid's top edge, to clear the tree, which overhangs the grid's top left corner.
export const TOP_DROP = 3.9;

// The area the ArmyHud fills: from the screen's left and bottom edges to the grid's resting left edge and just under
// the tree. The grid's left edge never moves (see armyGridCenter), so the area is the same every round. The room left
// to the screen's left and bottom edges and to the grid is the grid's own room under it.
export const columnLayout = (grid: ArmyGrid) => {
	const rest = armyGridCenter(grid);
	const margin = rest.y - (grid.height * grid.cellSize) / 2;
	const right = rest.x - (grid.width * grid.cellSize) / 2 - margin;
	const top = rest.y + (grid.height * grid.cellSize) / 2 - TOP_DROP;
	return { left: margin, right, top, bottom: margin };
};

// A rounded wooden panel: a thick dark outline, a wooden fill and a light rim inside the outline, as on the rarity odds.
export const drawWoodPanel = (
	context: CanvasRenderingContext2D,
	left: number,
	top: number,
	width: number,
	height: number,
	unit: number,
) => {
	const radius = unit * 1.2;
	context.beginPath();
	context.roundRect(left, top, width, height, radius);
	context.fillStyle = PANEL_FILL;
	context.fill();
	context.lineWidth = unit * 0.5;
	context.strokeStyle = OUTLINE;
	context.stroke();
	const inset = unit * 0.4;
	context.beginPath();
	context.roundRect(left + inset, top + inset, width - 2 * inset, height - 2 * inset, radius - inset);
	context.lineWidth = unit * 0.15;
	context.strokeStyle = PANEL_RIM;
	context.stroke();
};
