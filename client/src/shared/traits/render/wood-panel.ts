import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

export const WOOD_BORDER = 5;
export const WOOD_PLANK = 8;

// A panel of horizontal planks in a nailed frame, cut in nine pieces drawn by scripts/generate-wood-panel.py: the
// corners keep their size, the edges and the planks repeat, all at `p` canvas pixels per art pixel. The frame is
// drawn outside of the given area, so the planks fill it exactly.
export function drawWoodPanel(
	context: CanvasRenderingContext2D,
	left: number,
	top: number,
	width: number,
	height: number,
	p: number,
): void {
	const parts = HudElementResources.woodPanel;
	if (!Object.values(parts).every((image) => image.complete && image.naturalWidth > 0)) return;
	const edge = WOOD_BORDER * p;
	const x = Math.round(left);
	const y = Math.round(top);
	const w = Math.round(width);
	const h = Math.round(height);

	context.save();
	context.imageSmoothingEnabled = false;
	context.beginPath();
	context.rect(x, y, w, h);
	context.clip();
	const tile = parts.center;
	for (let ty = 0; ty < h; ty += tile.height * p) {
		for (let tx = 0; tx < w; tx += tile.width * p) {
			context.drawImage(tile, x + tx, y + ty, tile.width * p, tile.height * p);
		}
	}
	context.restore();

	context.save();
	context.imageSmoothingEnabled = false;
	context.drawImage(parts.topLeft, x - edge, y - edge, edge, edge);
	context.drawImage(parts.top, x, y - edge, w, edge);
	context.drawImage(parts.topRight, x + w, y - edge, edge, edge);
	context.drawImage(parts.left, x - edge, y, edge, h);
	context.drawImage(parts.right, x + w, y, edge, h);
	context.drawImage(parts.bottomLeft, x - edge, y + h, edge, edge);
	context.drawImage(parts.bottom, x, y + h, w, edge);
	context.drawImage(parts.bottomRight, x + w, y + h, edge, edge);
	context.restore();
}
