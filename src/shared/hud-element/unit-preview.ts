import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../traits/tdrawable";
import { Position } from "../position";
import { Barrack } from "../../engine/barrack/recruit/barrack-recruit";
import { AnyBattleBarrack } from "../../engine/barrack/battle/battle-barrack";

export class UnitPreviewHud extends Derive(TDrawable) {
	objective = 100;
	constructor(public barrack: ImplementsTrait<typeof Barrack> | AnyBattleBarrack) {
		super({});
	}

	drawPriority = 8;
	draw(context: CanvasRenderingContext2D, position: Position): void {
		const recruit = this.barrack.unitRecruit;
		if (!recruit) return;
		context.globalAlpha = 1;
		const size = this.getCanvasSize(context, recruit.drawable.size.width, recruit.drawable.size.height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, size, canvasPosition, recruit.drawable.image);
	}
}
