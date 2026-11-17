import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { ScreenPosition } from "../../shared/position";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Buyable } from "../shop/retail/buyable";
import { TRenderable } from "../../shared/traits/render/renderable";

export class RetailGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	override hoverEffect: HoverEffect[] | null;
	tiles: Map<string, Buyable> = new Map();
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		screenPosition = new ScreenPosition(PercentToReal({ x: 35, y: 72 })),
		width: number = 11,
		height: number = 5,
		cellSize: number = 4,
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	getBuyables() {
		return [...this.tiles.values()];
	}

	override render(context: CanvasRenderingContext2D): void {
		context.globalAlpha = 1;
		const position = this.getCanvasPosition(context, this.position);
		const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
		const width = this.width * tileSize;
		const height = this.height * tileSize;
		// The canvas position is the bottom left corner: the area goes up from it
		const left = position.x;
		const top = position.y - height;
		context.fillStyle = "#583927";
		context.fillRect(left, top, width, height);
		this.renderBorder(context, left, top, width, height, tileSize);
	}

	// Wooden frame drawn around the area, as nested bands from the dark outline to the inner bevel, in whole pixels
	renderBorder(
		context: CanvasRenderingContext2D,
		left: number,
		top: number,
		width: number,
		height: number,
		tileSize: number,
	) {
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
}
