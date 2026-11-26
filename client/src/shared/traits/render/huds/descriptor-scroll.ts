import { DescriptorScrollParts } from "../../../../renderer/resources/hud-element.resources";

// Art pixels, as in scripts/generate-descriptor-scroll.py.
export const ROLL_END = 10;
export const ROLL_TOP = 6;
export const ROLL_BOTTOM = 4;
export const ROLL_MIN = ROLL_TOP + 1 + ROLL_BOTTOM;
// The rows of ink on the top and the bottom of a roll, which its text stays out of.
export const ROLL_INK_TOP = 2;
export const ROLL_INK_BOTTOM = 4;
export const SHADE = 2;
const EDGE = 7;

export type ScrollShape = {
	columns: number;
	topRoll: number;
	bottomRoll: number;
	// The rows of sheet between the two rolls.
	body: number;
};

export function scrollRows(shape: ScrollShape) {
	return shape.topRoll + shape.body + shape.bottomRoll;
}

function ready(parts: DescriptorScrollParts) {
	return Object.values(parts).every((image) => image.complete && image.naturalWidth > 0);
}

// Draws a roll `rows` tall: the first ROLL_TOP and the last ROLL_BOTTOM rows of the image as they are, the one between
// them repeated.
function drawRoll(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	width: number,
	rows: number,
	p: number,
) {
	const w = image.naturalWidth;
	context.drawImage(image, 0, 0, w, ROLL_TOP, x, y, width, ROLL_TOP * p);
	context.drawImage(image, 0, ROLL_TOP, w, 1, x, y + ROLL_TOP * p, width, (rows - ROLL_MIN + 1) * p);
	context.drawImage(image, 0, ROLL_TOP + 1, w, ROLL_BOTTOM, x, y + (rows - ROLL_BOTTOM) * p, width, ROLL_BOTTOM * p);
}

// A parchment sheet hanging between two rolls of any height, one art pixel being `p` canvas pixels. The rolls carry the
// title and the tags, so the caller picks their height. (left, top) is the top left corner of the top roll, and the
// roll's shadow falls under the scroll's last row.
export function drawDescriptorScroll(
	context: CanvasRenderingContext2D,
	parts: DescriptorScrollParts,
	left: number,
	top: number,
	shape: ScrollShape,
	p: number,
) {
	if (!ready(parts)) return;
	const { columns, topRoll, bottomRoll } = shape;
	const rows = scrollRows(shape);
	const width = columns * p;
	const sheetTop = top + Math.floor(topRoll / 2) * p;
	const sheetBottom = top + (rows - Math.floor(bottomRoll / 2)) * p;
	const innerLeft = left + EDGE * p;
	const innerWidth = width - 2 * EDGE * p;

	context.save();
	context.imageSmoothingEnabled = false;
	const tile = parts.center;
	for (let y = 0; y < sheetBottom - sheetTop; y += tile.height * p) {
		for (let x = 0; x < innerWidth; x += tile.width * p) {
			const w = Math.min(tile.width * p, innerWidth - x);
			const h = Math.min(tile.height * p, sheetBottom - sheetTop - y);
			context.drawImage(tile, 0, 0, w / p, h / p, innerLeft + x, sheetTop + y, w, h);
		}
	}
	for (let y = sheetTop; y < sheetBottom; y += p) {
		context.drawImage(parts.edgeLeft, left, y, EDGE * p, p);
		context.drawImage(parts.edgeRight, left + width - EDGE * p, y, EDGE * p, p);
	}
	context.drawImage(parts.shade, innerLeft, top + topRoll * p, innerWidth, SHADE * p);
	context.drawImage(parts.shade, innerLeft, top + (rows - bottomRoll - SHADE) * p, innerWidth, SHADE * p);
	context.drawImage(parts.shadow, left + 2 * p, top + rows * p, width - 4 * p, SHADE * p);

	const bottomY = top + (rows - bottomRoll) * p;
	for (const [y, roll] of [
		[top, topRoll],
		[bottomY, bottomRoll],
	] as const) {
		drawRoll(context, parts.rollLeft, left, y, ROLL_END * p, roll, p);
		drawRoll(context, parts.roll, left + ROLL_END * p, y, width - 2 * ROLL_END * p, roll, p);
		drawRoll(context, parts.rollRight, left + width - ROLL_END * p, y, ROLL_END * p, roll, p);
	}
	context.restore();
}
