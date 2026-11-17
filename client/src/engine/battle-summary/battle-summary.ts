import { Derive } from "@ddd-ts/traits";
import { SummaryState } from "../../shared/gamestate";

import { Game } from "../game";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TDrawable } from "../../shared/traits/render/drawable";
import { TRenderable } from "../../shared/traits/render/renderable";
import { RenderableState } from "../../renderer/renderer";
import { DrawPriority } from "../../shared/traits/render/image-drawable";
import { Battle } from "../battle/battle";
import { BattleVerdictHud } from "./huds/battle-verdict-hud";
import { HideHud } from "./huds/hide-hud";
import { NextRoundHud } from "./huds/next-round-hud";
import { LifeRemainingHud } from "./huds/life-remaining-hud";

export class BattleVerdict extends Derive(TDrawable, TRenderable) {
	hiddenState: { hidden: boolean } = { hidden: false };
	hideHud: HideHud;
	battleVerdictHud: BattleVerdictHud;
	nextRoundHud: NextRoundHud;
	lifeRemainingHud: LifeRemainingHud;
	constructor(
		public verdict: "Victory" | "Defeat",
		public life: number,
	) {
		super({});
		this.hideHud = new HideHud(this.hiddenState);
		this.battleVerdictHud = new BattleVerdictHud(this.verdict);
		this.nextRoundHud = new NextRoundHud();
		this.lifeRemainingHud = new LifeRemainingHud(this.life);
	}

	toggleHide() {
		this.hiddenState.hidden = !this.hiddenState.hidden;
	}
	drawPriority = DrawPriority.HUD;

	draw(context: CanvasRenderingContext2D): void {
		this.hideHud.render(context);
		if (this.hiddenState.hidden) return;
		this.battleVerdictHud.render(context);
		this.nextRoundHud.render(context);
		this.lifeRemainingHud.render(context);
	}

	getHudElements() {
		return [this.hideHud, this.battleVerdictHud, this.nextRoundHud, this.lifeRemainingHud];
	}

	get position() {
		return PercentToReal({ x: 50, y: 50 });
	}
}

export class BattleSummary {
	public battleVerdict: BattleVerdict;

	constructor(
		public battle: Battle,
		public verdict: "Victory" | "Defeat",

		public onSummaryQuit: Game["handleSummaryQuit"],

		public life: number,
	) {
		this.battleVerdict = new BattleVerdict(verdict, this.life);
	}

	getState(): SummaryState {
		const summaryState: SummaryState = {
			type: "summary",
			battleVerdict: this.battleVerdict,
			grid: this.battle.battlefield.grid,
			battleState: this.battle.getState(),
			hudElements: this.battleVerdict.getHudElements(),
			hidden: this.battleVerdict.hiddenState.hidden,
		};
		return summaryState;
	}

	getDrawables(): RenderableState {
		const renderState = this.battle.getDrawables();
		renderState.renderables.push(this.battleVerdict);
		return renderState;
	}

	quitSummary() {
		this.onSummaryQuit();
	}

	toggleHide() {
		this.battleVerdict.toggleHide();
	}
}
