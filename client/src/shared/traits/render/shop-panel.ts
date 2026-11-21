// The shop counter and its sign share the same wooden face and pixel bevel.
export function drawShopPanel(
	context: CanvasRenderingContext2D,
	left: number,
	top: number,
	width: number,
	height: number,
	tileSize: number,
): void {
	context.fillStyle = "#583927";
	context.fillRect(left, top, width, height);
	const unit = Math.max(1, Math.round(tileSize / 16));
	const bands = [
		{ color: "#2a1a10", inset: -4 * unit, thickness: unit },
		{ color: "#8a5a34", inset: -3 * unit, thickness: 2 * unit },
		{ color: "#b07a48", inset: -3 * unit, thickness: unit },
		{ color: "#2a1a10", inset: -unit, thickness: unit },
	];
	const x = Math.round(left);
	const y = Math.round(top);
	const w = Math.round(width);
	const h = Math.round(height);
	for (const { color, inset, thickness } of bands) {
		context.fillStyle = color;
		const bx = x + inset;
		const by = y + inset;
		const bw = w - 2 * inset;
		const bh = h - 2 * inset;
		context.fillRect(bx, by, bw, thickness);
		context.fillRect(bx, by + bh - thickness, bw, thickness);
		context.fillRect(bx, by, thickness, bh);
		context.fillRect(bx + bw - thickness, by, thickness, bh);
	}
}
