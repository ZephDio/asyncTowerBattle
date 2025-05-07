import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../../traits/render/drawable";
import { Barrack } from "../../../engine/constructs/barrack/recruit/barrack";
import { AnyBattleBarrack } from "../../../engine/constructs/barrack/battle/battle-barrack";
import { ScreenPosition } from "../../position";
import { DrawPriority } from "../../traits/render/image-drawable";
export class UnitPreviewHud extends Derive(TDrawable) {
	objective = 100;
	constructor(public barrack: ImplementsTrait<typeof Barrack> | AnyBattleBarrack) {
		super({});
	}

	drawPriority = DrawPriority.HUD;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const recruit = this.barrack.unitRecruit;
		if (!recruit) return;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, recruit.drawable.size.width, recruit.drawable.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, size, canvasPosition, recruit.getView(0)); // TODO
	}
}
