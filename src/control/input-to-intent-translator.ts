import { Game } from "../engine/game";
import { ScreenPosition } from "../shared/position";
import { ArmyGrid } from "../engine/grid/grid";
import { MouseEventType } from "./mouse-event-handler";
import { Battle } from "../engine/battle/battle";
import { ShopPhase } from "../engine/shop/shop";
import { BattleSummary } from "../engine/battle-summary/battle-summary";
import { ShopInputToIntentTranslator } from "./translators/shop-input-translator";
import { BattleInputToIntentTranslator } from "./translators/battle-input-translator";
import { BattleSummaryInputToIntentTranslator } from "./translators/battlesummary-input-translator";

export interface PlayerIntent {
	intent: string;
}

ArmyGrid;

export class InputToIntent {
	battleTranslator = new BattleInputToIntentTranslator();
	shopTranslator = new ShopInputToIntentTranslator();
	battleSummaryTranslator = new BattleSummaryInputToIntentTranslator();
	constructor(public game: Game) {}

	handle(screenPosition: ScreenPosition, eventType: MouseEventType) {
		//this.isGameAction() TODO
		const phase = this.determinatePhase(this.game);
		if (phase instanceof Battle) {
			this.battleTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof ShopPhase) {
			this.shopTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof BattleSummary) {
			this.battleSummaryTranslator.handle(screenPosition, eventType, phase);
		}
	}
	determinatePhase(game: Game) {
		if (game.battle) {
			return game.battle;
		}
		if (game.shop) {
			return game.shop;
		}
		if (game.battleSummary) {
			return game.battleSummary;
		}
		throw new Error("No Active Phase");
	}
}
