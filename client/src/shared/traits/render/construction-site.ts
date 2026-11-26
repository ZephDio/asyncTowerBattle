import { HudElementResources } from "../../../renderer/resources/hud-element.resources";
import { Cell } from "../../position";

// The art of scripts/generate-construction-site.py: CELL art pixels per cell, cut in quarters; the rope runs ROPE art
// pixels inside the plot's outer edges, and the stake's foot is at STAKE_FOOT in its image.
const CELL = 48;
const QUARTER = CELL / 2;
const ROPE = 7.5;
const STAKE_FOOT = { x: 4, y: 12 };

// Each corner of a cell, as in the rows of site.png: its side on screen and the offsets of its horizontal, vertical
// and diagonal neighbors in grid cells (y up).
const CORNERS = [
	{ right: false, bottom: false, h: [-1, 0], v: [0, 1], d: [-1, 1] },
	{ right: true, bottom: false, h: [1, 0], v: [0, 1], d: [1, 1] },
	{ right: false, bottom: true, h: [-1, 0], v: [0, -1], d: [-1, -1] },
	{ right: true, bottom: true, h: [1, 0], v: [0, -1], d: [1, -1] },
] as const;

const key = (x: number, y: number) => `${x},${y}`;

// The column of site.png for a corner whose horizontal, vertical and diagonal neighbors are in the plot or not.
function quarterCase(h: boolean, v: boolean, d: boolean) {
	if (!h) return v ? 2 : 0;
	if (!v) return 1;
	return d ? 4 : 3;
}

// Cells by which a plot reaches past its cells on every side, so it shows around the piece standing on it. A plot
// spreads less when another one, another plot's price sign or the edge of the ground is close, so they never overlap.
const SPREAD = 0.15;

// A building site: its cells, as offsets in grid cells (y up), the canvas point where the middle of their bounding box
// goes, the price sign planted on it, which the other sites keep clear of, and its scale: a shrunk offer's site is
// drawn smaller with it, rope and stakes included.
export type Plot = { cells: Cell[]; center: { x: number; y: number }; sign?: Box; scale?: number };

export type Box = { left: number; top: number; right: number; bottom: number };

function boxOf(plot: Plot, tileSize: number) {
	const xs = plot.cells.map((cell) => cell.x);
	const ys = plot.cells.map((cell) => cell.y);
	const minX = Math.min(...xs);
	const maxY = Math.max(...ys);
	const columns = Math.max(...xs) - minX + 1;
	const rows = maxY - Math.min(...ys) + 1;
	const left = plot.center.x - (columns * tileSize) / 2;
	const top = plot.center.y - (rows * tileSize) / 2;
	return {
		minX,
		maxY,
		columns,
		rows,
		box: { left, top, right: left + columns * tileSize, bottom: top + rows * tileSize },
	};
}

// The empty space between two boxes, across or down, whichever is wider.
function gap(a: Box, b: Box) {
	return Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom, 0);
}

// How far a box stays inside the bounds, on its closest side.
function room(box: Box, bounds: Box) {
	return Math.max(
		0,
		Math.min(box.left - bounds.left, bounds.right - box.right, box.top - bounds.top, bounds.bottom - box.bottom),
	);
}

// Building sites of bare earth roped off by stakes, at `tileSize` canvas pixels per cell (times each plot's scale), on
// the ground within `bounds`.
export function drawConstructionSites(
	context: CanvasRenderingContext2D,
	plots: Plot[],
	tileSize: number,
	bounds: Box,
): void {
	const { quarters, stake } = HudElementResources.constructionSite;
	if (![quarters, stake].every((image) => image.complete && image.naturalWidth > 0)) return;
	const boxes = plots.map((plot) => boxOf(plot, tileSize * (plot.scale ?? 1)));
	const stakes: { x: number; y: number; p: number }[] = [];

	context.save();
	context.globalAlpha = 1;
	context.imageSmoothingEnabled = false;
	plots.forEach((plot, index) => {
		const { minX, maxY, columns, rows, box } = boxes[index]!;
		const cellSize = tileSize * (plot.scale ?? 1);
		const p = cellSize / CELL;
		const others = boxes.filter((_, other) => other !== index).map((other) => gap(box, other.box) / 2);
		const signs = plots.flatMap((other, i) => (i !== index && other.sign ? [gap(box, other.sign)] : []));
		const spread = Math.min(SPREAD * cellSize, room(box, bounds), ...others, ...signs);
		// The plot's art is stretched from its middle to spread past its cells.
		const scaleX = (columns * cellSize + 2 * spread) / (columns * cellSize);
		const scaleY = (rows * cellSize + 2 * spread) / (rows * cellSize);
		const toCanvas = (x: number, y: number) => ({
			x: plot.center.x + (x - plot.center.x) * scaleX,
			y: plot.center.y + (y - plot.center.y) * scaleY,
		});
		const own = new Set(plot.cells.map((cell) => key(cell.x, cell.y)));
		const has = (cell: Cell, [dx, dy]: readonly number[]) => own.has(key(cell.x + dx!, cell.y + dy!));

		for (const cell of plot.cells) {
			const left = box.left + (cell.x - minX) * cellSize;
			const top = box.top + (maxY - cell.y) * cellSize;
			CORNERS.forEach((corner, row) => {
				const column = quarterCase(has(cell, corner.h), has(cell, corner.v), has(cell, corner.d));
				const half = cellSize / 2;
				const from = toCanvas(left + (corner.right ? half : 0), top + (corner.bottom ? half : 0));
				const to = toCanvas(left + (corner.right ? cellSize : half), top + (corner.bottom ? cellSize : half));
				const x0 = Math.round(from.x);
				const y0 = Math.round(from.y);
				const width = Math.round(to.x) - x0;
				const height = Math.round(to.y) - y0;
				context.drawImage(quarters, column * QUARTER, row * QUARTER, QUARTER, QUARTER, x0, y0, width, height);
				// Stakes stand where the rope turns, at the outer and inner corners, and where it crosses a boundary between
				// two of the plot's cells (counted by one of the two cells only).
				const inwardX = (corner.right ? -1 : 1) * ROPE * p * scaleX;
				const inwardY = (corner.bottom ? -1 : 1) * ROPE * p * scaleY;
				const vertex = toCanvas(left + (corner.right ? cellSize : 0), top + (corner.bottom ? cellSize : 0));
				if (column === 0 || column === 3) stakes.push({ x: vertex.x + inwardX, y: vertex.y + inwardY, p });
				if (column === 1 && corner.right) stakes.push({ x: vertex.x, y: vertex.y + inwardY, p });
				if (column === 2 && corner.bottom) stakes.push({ x: vertex.x + inwardX, y: vertex.y, p });
			});
		}
	});
	stakes.sort((a, b) => a.y - b.y);
	for (const { x, y, p } of stakes) {
		context.drawImage(
			stake,
			Math.round(x - STAKE_FOOT.x * p),
			Math.round(y - STAKE_FOOT.y * p),
			Math.round(stake.width * p),
			Math.round(stake.height * p),
		);
	}
	context.restore();
}
