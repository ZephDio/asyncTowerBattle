import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../../shared/position";

import { ArmyGrid } from "../grid";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { HudElementResources } from "../../../renderer/resources/hud-element.resources";
import { IconResource } from "../../../renderer/resources/icons.resources";

export type CellEffectIcons = { active: IconResource; inactive: IconResource };

export const SYNERGY_ICONS: CellEffectIcons = {
	active: HudElementResources.patternStarActive,
	inactive: HudElementResources.patternStarInactive,
};

// A tower target cell: red when it holds a path tile the tower can shoot at, grey otherwise.
export const TARGET_ICONS: CellEffectIcons = {
	active: HudElementResources.targetBowActive,
	inactive: HudElementResources.targetBowInactive,
};

export class SynergyEffectHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	size: number;
	constructor(
		public cell: Cell,
		public grid: ArmyGrid,
		public isActivated: boolean,
		public icons: CellEffectIcons = SYNERGY_ICONS,
	) {
		super({});
		this.size = grid.cellSize;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.globalAlpha = 1;
		const icon = this.isActivated ? this.icons.active : this.icons.inactive;
		const { width, height } = this.getCanvasSize(context, this.size, this.size);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, { width: width / 2, height: height / 2 }, canvasPosition, icon.image);
	}

	get position() {
		return this.cell;
	}
}
