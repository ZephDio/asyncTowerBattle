import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../../traits/render/drawable";
import { Barrack } from "../../../engine/constructs/barrack/recruit/barrack";
import { AnyBattleBarrack } from "../../../engine/constructs/barrack/battle/battle-barrack";
import { ScreenPosition } from "../../position";
import { DrawPriority } from "../../traits/render/image-drawable";

// The unit a barrack spawns, drawn above it: the unit put on it, or the army's basic unit when it holds none.
export class UnitPreviewHud extends Derive(TDrawable) {
	objective = 100;
	constructor(public barrack: ImplementsTrait<typeof Barrack> | AnyBattleBarrack) {
		super({});
	}

	drawPriority = DrawPriority.HUD;
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const unit = this.barrack.bondedUnit;
		if (!unit || !implementsTrait(unit, TDrawable)) return;
		context.globalAlpha = 1;
		unit.draw(context, position, scale);
	}
}
