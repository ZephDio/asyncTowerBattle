import { Size } from "../../../size";

type Rgb = readonly [number, number, number];

// Dark to light: the fill's bottom shade, its face, its lit band and the top highlight.
export type MeterRamp = readonly [Rgb, Rgb, Rgb, Rgb];

export const LifeRamp: MeterRamp = [
	[104, 26, 52],
	[176, 38, 56],
	[226, 74, 68],
	[252, 156, 124],
];
export const FoodRamp: MeterRamp = [
	[124, 72, 30],
	[200, 132, 34],
	[240, 190, 56],
	[252, 236, 150],
];
export const FamineRamp: MeterRamp = [
	[66, 52, 60],
	[98, 82, 84],
	[128, 112, 108],
	[160, 146, 134],
];

const INK: Rgb = [22, 28, 46];
const TROUGH: Rgb = [38, 32, 48];
const TROUGH_SHADOW: Rgb = [28, 24, 38];
const ALERT: Rgb = [214, 48, 48];
const TEXT = "#fff4dc";

// Meter size in art pixels: a 2px ink frame around a 10px tall trough.
const WIDTH = 80;
const HEIGHT = 14;
const FRAME = 2;
const SEGMENTS = 5;

const css = ([r, g, b]: Rgb) => `rgb(${r},${g},${b})`;

// A pixel-art meter of `size` canvas pixels. Its art pixels snap to whole canvas pixels, so it stays crisp at every
// canvas size.
export function drawPixelMeter(
	context: CanvasRenderingContext2D,
	center: { x: number; y: number },
	size: Size,
	proportion: number,
	ramp: MeterRamp,
	label: string,
	alert = false,
) {
	const pixel = Math.min(size.width / WIDTH, size.height / HEIGHT);
	const left = center.x - (WIDTH * pixel) / 2;
	const top = center.y - (HEIGHT * pixel) / 2;
	const rect = (x: number, y: number, w: number, h: number, color: Rgb) => {
		if (w <= 0 || h <= 0) return;
		const x0 = Math.round(left + x * pixel);
		const y0 = Math.round(top + y * pixel);
		context.fillStyle = css(color);
		context.fillRect(x0, y0, Math.round(left + (x + w) * pixel) - x0, Math.round(top + (y + h) * pixel) - y0);
	};

	const frame = alert ? ALERT : INK;
	rect(1, 0, WIDTH - 2, HEIGHT, frame);
	rect(0, 1, WIDTH, HEIGHT - 2, frame);

	const innerWidth = WIDTH - 2 * FRAME;
	const innerHeight = HEIGHT - 2 * FRAME;
	rect(FRAME, FRAME, innerWidth, innerHeight, TROUGH);
	rect(FRAME, FRAME, innerWidth, 2, TROUGH_SHADOW);

	const clamped = Math.min(1, Math.max(0, Number.isFinite(proportion) ? proportion : 0));
	const filled = clamped > 0 ? Math.max(1, Math.round(innerWidth * clamped)) : 0;
	const [shade, face, lit, highlight] = ramp;
	rect(FRAME, FRAME, filled, innerHeight, face);
	rect(FRAME, FRAME, filled, 1, highlight);
	rect(FRAME, FRAME + 1, filled, 2, lit);
	rect(FRAME, FRAME + innerHeight - 2, filled, 2, shade);
	if (filled > 1 && filled < innerWidth) {
		rect(FRAME + filled - 1, FRAME, 1, innerHeight - 2, lit);
	}
	for (let segment = 1; segment < SEGMENTS; segment++) {
		const x = FRAME + Math.round((innerWidth * segment) / SEGMENTS);
		rect(x, FRAME + 3, 1, innerHeight - 5, x < FRAME + filled ? shade : TROUGH_SHADOW);
	}

	context.save();
	context.font = `${(innerHeight + 2) * pixel}px text`;
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.lineJoin = "round";
	context.lineWidth = 2 * pixel;
	context.strokeStyle = css(INK);
	context.fillStyle = TEXT;
	const textY = top + (HEIGHT * pixel) / 2 + pixel;
	context.strokeText(label, left + (WIDTH * pixel) / 2, textY, innerWidth * pixel);
	context.fillText(label, left + (WIDTH * pixel) / 2, textY, innerWidth * pixel);
	context.restore();
}

// Cream text with an ink outline, readable on either faction's cloth.
export function drawOutlinedText(
	context: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	fontSize: number,
	color = TEXT,
	align: CanvasTextAlign = "center",
) {
	context.save();
	context.font = `${fontSize}px text`;
	context.textAlign = align;
	context.textBaseline = "middle";
	context.lineJoin = "round";
	context.lineWidth = Math.max(2, fontSize / 5);
	context.strokeStyle = css(INK);
	context.fillStyle = color;
	context.strokeText(text, x, y);
	context.fillText(text, x, y);
	context.restore();
}

export const FamineColor = css(ALERT);

// Banner layout of a meter, in screen units from the bar's position: the meter sits right of center, its icon caps
// the meter's left end.
export const MeterSize = { width: 12.4, height: 2.2 };
export const MeterOffset = 1;
export const MeterIconSide = 2.6;
export const MeterIconOffset = MeterOffset - MeterSize.width / 2 - 0.6;
