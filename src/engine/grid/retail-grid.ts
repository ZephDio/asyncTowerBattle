import { Derive } from "@ddd-ts/traits";
import { TGridDrawable, TRenderable } from "../../shared/traits/drawable";
import { TGrid } from "./tgrid";
import { HoverEffect } from "./grid-effects/hover-effect";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { ScreenPosition } from "../../shared/position";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Buyable } from "../shop/retail/buyable";

export class RetailGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, Buyable> = new Map();
	overEffect: HoverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];

	constructor(
		public position = new ScreenPosition(PercentToReal({ x: 5, y: 55 })),
		public width: number = 11,
		public height: number = 5,
		public cellSize: number = 4.5,
	) {
		super({});
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
