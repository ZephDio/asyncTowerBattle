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
import { GameWrapper } from "../engine/wrap";
import { MainMenu } from "../engine/menu/main-menu";
import { RunResume } from "../engine/run-resume/run-resume";
import { RunResumeInputToIntentTranslator } from "./translators/run-resume-input-translator";
import { MainMenuInputToIntentTranslator } from "./translators/main-menu-input-translator";

export interface PlayerIntent {
	intent: string;
}

// Intents sent by the page shell around the canvas (React), rather than read from mouse positions on the canvas.
export type GameIntent = { intent: "open-tutorial" } | { intent: "close-tutorial" };
export type SendGameIntent = (intent: GameIntent) => void;
// What the page shell holds of the game: a way to send it intents, and to hear when the tutorial opens or closes.
export type GameLink = {
	send: SendGameIntent;
	// Returns the unsubscribe function.
	onTutorialChange: (listener: (open: boolean) => void) => () => void;
};

ArmyGrid;

export class InputToIntent {
	battleTranslator: BattleInputToIntentTranslator;
	shopTranslator: ShopInputToIntentTranslator;
	battleSummaryTranslator: BattleSummaryInputToIntentTranslator;
	mainMenuTranslator: MainMenuInputToIntentTranslator;
	runResumeTranslator = new RunResumeInputToIntentTranslator();
	constructor(public gameWrap: GameWrapper) {
		this.battleTranslator = new BattleInputToIntentTranslator();
		this.shopTranslator = new ShopInputToIntentTranslator();
		this.battleSummaryTranslator = new BattleSummaryInputToIntentTranslator(this.battleTranslator);
		this.mainMenuTranslator = new MainMenuInputToIntentTranslator(gameWrap);
	}

	handleIntent({ intent }: GameIntent) {
		if (intent === "open-tutorial") this.gameWrap.openTutorial();
		if (intent === "close-tutorial") this.gameWrap.closeTutorial();
	}

	// Set from the press that closed the tutorial until its release, so that whole gesture stays out of the game.
	private swallowingGesture = false;

	handle(screenPosition: ScreenPosition, eventType: MouseEventType) {
		// The open tutorial covers the game: any click on the canvas closes it and does nothing else.
		if (this.gameWrap.tutorial || this.swallowingGesture) {
			if (eventType === "down" || eventType === "right-click") {
				this.gameWrap.closeTutorial();
				this.swallowingGesture = eventType === "down";
			}
			if (eventType === "up") this.swallowingGesture = false;
			return;
		}
		//this.isGameAction() TODO
		const phase = this.determinatePhase(this.gameWrap);
		if (phase instanceof Battle) {
			this.battleTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof ShopPhase) {
			this.shopTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof BattleSummary) {
			this.battleSummaryTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof RunResume) {
			this.runResumeTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof MainMenu) {
			this.mainMenuTranslator.handle(screenPosition, eventType, phase);
		}
	}
	determinatePhase(gameWrap: GameWrapper) {
		if (gameWrap.state === "game") {
			const game = gameWrap.game as Game;
			if (game.battle) {
				return game.battle;
			}
			if (game.shop) {
				return game.shop;
			}
			if (game.battleSummary) {
				return game.battleSummary;
			}
			if (game.runResume) {
				return game.runResume;
			}
			throw new Error("No Active Phase");
		}
		if (gameWrap.state === "mainMenu") {
			return gameWrap.mainMenu;
		}
		throw new Error("No Active Phase");
	}
}
