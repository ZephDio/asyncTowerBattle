import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

// Where the fenced rectangle's corners sit in the corner pieces, in art pixels from their outer sides: printed by
// scripts/generate-fence.py.
const FENCE_INSET = { left: 8, top: 26, right: 8, bottom: 8 };
// One bay of the fence, in art pixels, across (top and bottom pieces) and down (side pieces).
const BAY_WIDTH = 32;
const BAY_HEIGHT = 28;

const IMAGES = Object.values(HudElementResources.fence);

// Splits `length` in `count` runs whose ends land on whole pixels, from `start`.
function runs(start: number, length: number, count: number): { from: number; size: number }[] {
	return Array.from({ length: count }, (_, i) => {
		const from = Math.round(start + (length * i) / count);
		return { from, size: Math.round(start + (length * (i + 1)) / count) - from };
	});
}

// The wooden fence of scripts/generate-fence.py standing on the border of the given rectangle, at `p` canvas pixels
// per art pixel. The corners keep their size and the sides repeat a whole number of bays, slightly stretched to fit.
// The back fence rises above the rectangle, the front one over its bottom edge.
export function drawFence(
	context: CanvasRenderingContext2D,
	left: number,
	top: number,
	width: number,
	height: number,
	p: number,
): void {
	const parts = HudElementResources.fence;
	if (!IMAGES.every((image) => image.complete && image.naturalWidth > 0)) return;
	const x0 = Math.round(left - FENCE_INSET.left * p);
	const x1 = Math.round(left + width + FENCE_INSET.right * p);
	const y0 = Math.round(top - FENCE_INSET.top * p);
	const y1 = Math.round(top + height + FENCE_INSET.bottom * p);
	const leftWidth = Math.round(parts.topLeft.width * p);
	const rightWidth = Math.round(parts.topRight.width * p);
	const topHeight = Math.round(parts.top.height * p);
	const bottomHeight = Math.round(parts.bottom.height * p);
	const across = x1 - rightWidth - (x0 + leftWidth);
	const down = y1 - bottomHeight - (y0 + topHeight);
	const columns = runs(x0 + leftWidth, across, Math.max(1, Math.round(across / (BAY_WIDTH * p))));
	const rows = runs(y0 + topHeight, down, Math.max(1, Math.round(down / (BAY_HEIGHT * p))));

	context.save();
	context.globalAlpha = 1;
	context.imageSmoothingEnabled = false;
	context.drawImage(parts.topLeft, x0, y0, leftWidth, topHeight);
	for (const { from, size } of columns) context.drawImage(parts.top, from, y0, size, topHeight);
	context.drawImage(parts.topRight, x1 - rightWidth, y0, rightWidth, topHeight);
	for (const { from, size } of rows) {
		context.drawImage(parts.left, x0, from, leftWidth, size);
		context.drawImage(parts.right, x1 - rightWidth, from, rightWidth, size);
	}
	const bottom = y1 - bottomHeight;
	context.drawImage(parts.bottomLeft, x0, bottom, leftWidth, bottomHeight);
	for (const { from, size } of columns) context.drawImage(parts.bottom, from, bottom, size, bottomHeight);
	context.drawImage(parts.bottomRight, x1 - rightWidth, bottom, rightWidth, bottomHeight);
	context.restore();
}
