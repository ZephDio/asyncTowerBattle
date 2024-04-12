import { Derive } from "@ddd-ts/traits";
import { BattleState, SummaryState } from "../../shared/gamestate";

import { Game } from "../game";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../../shared/position";
import { Resources } from "../../renderer/resources";
import { TDrawable } from "../../shared/traits/render/drawable";
import { TRenderable } from "../../shared/traits/render/renderable";

export class BattleVerdict extends Derive(TDrawable, TRenderable) {
	constructor(public verdict: "victory" | "defeat") {
		super({});
	}

	drawPriority = 5;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		const image = Resources.verdict[this.verdict].resource.image;
		const { width, height } = Resources.verdict[this.verdict].size;
		const size = this.getCanvasSize(context, width, height);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, size, canvasPosition, image);
	}
	get position() {
		return PercentToReal({ x: 50, y: 50 });
	}
}

export class BattleSummary {
	public battleVerdict: BattleVerdict;
	constructor(
		public lastBattleState: BattleState,
		public verdict: "victory" | "defeat",

		public onSummaryQuit: Game["handleSummaryQuit"],
	) {
		this.battleVerdict = new BattleVerdict(verdict);
	}

	getState(): SummaryState {
		const summaryState: SummaryState = {
			type: "summary",
			battleVerdict: this.battleVerdict,
			grid: this.lastBattleState.grid,
		};
		return summaryState;
	}

	getDrawables() {
		return {
			renderables: [this.battleVerdict],
			grids: [
				{
					grid: this.lastBattleState.grid,
					drawables: [
						...this.lastBattleState.units,
						...this.lastBattleState.projectiles,
						...this.lastBattleState.areaEffects,
					],
				},
			],
		};
	}

	quitSummary() {
		this.onSummaryQuit();
	}
}
