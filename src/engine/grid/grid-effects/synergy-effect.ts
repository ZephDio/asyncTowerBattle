import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { TRenderable } from "../../../shared/traits/drawable";
import { ArmyGrid, GridElement } from "../grid";
import { TDrawable } from "../../../shared/traits/tdrawable";

export class SynergyEffect extends Derive(TDrawable, TRenderable) {
	drawPriority = 8;
	size: number;
	constructor(
		public cell: Cell,
		public grid: ArmyGrid,
		public isActivatedCheck: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean,
	) {
		super({});
		this.size = grid.cellSize;
	}

	draw(context: CanvasRenderingContext2D, position: Position): void {
		context.globalAlpha = 0.4;
		context.fillStyle = "red";
		if (this.isActivatedCheck(this.grid.tiles.get(ArmyGrid.posToString(this.cell)))) {
			context.fillStyle = "blue";
		}
		const { width, height } = this.getCanvasSize(context, this.size, this.size);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawRectangle(context, { width: width / 2, height: height / 2 }, canvasPosition);
	}

	get position() {
		return this.cell;
	}

	static isActivated() {}
}
