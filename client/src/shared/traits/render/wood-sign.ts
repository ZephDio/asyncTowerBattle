import { drawWoodPanel } from "./wood-panel";

// A wooden sign with its label, centered on `position`. One art pixel is as wide as on the army banner: 12 screen units
// for its 60 pixels.
export function drawWoodSign(
	context: CanvasRenderingContext2D,
	center: { x: number; y: number },
	size: { width: number; height: number },
	unit: number,
	label: string,
): void {
	const artPixel = Math.max(1, Math.round(unit * 0.2));
	context.save();
	context.globalAlpha = 1;
	drawWoodPanel(context, center.x - size.width / 2, center.y - size.height / 2, size.width, size.height, artPixel);
	context.font = `${size.height * 0.58}px title`;
	context.fillStyle = "#ffe5ad";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillText(label, center.x, center.y);
	context.restore();
}
