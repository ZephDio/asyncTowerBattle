import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { ScreenPosition } from "../../shared/position";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Buyable } from "../shop/retail/buyable";
import { TRenderable } from "../../shared/traits/render/renderable";

export class RetailGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, Buyable> = new Map();
	overEffect: HoverEffect | null = null;
	synergiesEffects: SynergyEffect[] = [];

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
		context.fillStyle = "#583927";
		context.globalAlpha = 1;
		const position = this.getCanvasPosition(context, this.position);
		const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
		context.rect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
		context.fill();
		context.stroke();
	}
}
