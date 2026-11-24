import { RenderableState } from "../renderer/renderer";
import { Game } from "./game";
import { MainMenu } from "./menu/main-menu";
import { TutorialPanelHud } from "../shared/hud-element/tutorial-panel-hud";
import { deleteSavedGame, loadSavedGame } from "./saved-game/saved-game-api";

export class GameWrapper {
	state: "game" | "mainMenu" = "mainMenu";
	game = null as null | Game;
	mainMenu: MainMenu;
	// Shown over every phase while the page's "?" button is hovered or pinned, until a click on the canvas.
	tutorial: TutorialPanelHud | null = null;
	// Told whenever the tutorial opens or closes, so the page's "?" button can follow a close made in the game.
	private tutorialListeners: ((open: boolean) => void)[] = [];
	constructor() {
		this.mainMenu = new MainMenu();
	}

	// Asks the server for the game the logged-in player left running, and offers to continue it in the main menu.
	async loadSavedGame() {
		const saved = await loadSavedGame();
		this.mainMenu.setSavedGame(saved);
	}

	forgetSavedGame() {
		this.mainMenu.setSavedGame(null);
	}

	// Drops the game the player left running, for good.
	concede() {
		if (!this.mainMenu.savedGame) return;
		this.mainMenu.setSavedGame(null);
		deleteSavedGame();
	}

	continueGame() {
		const saved = this.mainMenu.savedGame;
		if (!saved) return;
		this.mainMenu.setSavedGame(null);
		this.game = Game.resume(saved, this.endGame.bind(this));
		this.state = "game";
	}

	// A new game wipes the player's saved one first, so it can't survive a save that fails: the shop that starts saves
	// the new game at round 1.
	startNewGame() {
		this.mainMenu.setSavedGame(null);
		deleteSavedGame();
		this.game = new Game(this.mainMenu.classesSelectorHud.selectedClass, this.endGame.bind(this));
		this.state = "game";
	}

	endGame() {
		this.game = null;
		this.state = "mainMenu";
	}

	openTutorial() {
		if (this.tutorial) return;
		this.tutorial = new TutorialPanelHud({});
		this.notifyTutorial();
	}

	closeTutorial() {
		if (!this.tutorial) return;
		this.tutorial = null;
		this.notifyTutorial();
	}

	onTutorialChange(listener: (open: boolean) => void) {
		this.tutorialListeners.push(listener);
		return () => {
			this.tutorialListeners = this.tutorialListeners.filter((other) => other !== listener);
		};
	}

	private notifyTutorial() {
		for (const listener of [...this.tutorialListeners]) listener(this.tutorial !== null);
	}

	getRenderState() {
		const state = this.phaseRenderState();
		if (!this.tutorial) return state;
		return { ...state, renderables: [...state.renderables, this.tutorial] };
	}

	private phaseRenderState(): RenderableState {
		if (this.state === "game" && this.game) return this.game.getRenderState();
		if (this.mainMenu) return this.mainMenu.getRenderState();
		throw new Error("GameWrapper.getRenderState: invalid state");
	}
}
