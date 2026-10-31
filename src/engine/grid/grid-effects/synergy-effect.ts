import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../../shared/position";

import { ArmyGrid } from "../grid";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";

export class SynergyEffectHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	size: number;
	constructor(
		public cell: Cell,
		public grid: ArmyGrid,
		public isActivated: boolean,
	) {
		super({});
		this.size = grid.cellSize;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const star = this.isActivated ? HudElementResources.patternStarActive : HudElementResources.patternStarInactive;
		const { width, height } = this.getCanvasSize(context, this.size, this.size);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, { width: width / 2, height: height / 2 }, canvasPosition, star.image);
	}

	get position() {
		return this.cell;
	}
}
