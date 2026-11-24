import { RenderableState } from "../renderer/renderer";
import { Game } from "./game";
import { MainMenu } from "./menu/main-menu";
import { TutorialPanelHud } from "../shared/hud-element/tutorial-panel-hud";
import { deleteSavedGame, loadSavedGame } from "./saved-game/saved-game-api";

const SAVED_GAME_LOAD_ATTEMPTS = 3;
const SAVED_GAME_RETRY_DELAY_MS = 1000;

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

	// Bumped whenever what the menu offers changes by itself (a game starts, the player logs out), so the answer of a
	// load asked before is dropped instead of bringing back a game that is gone.
	private savedGameLoads = 0;

	// Asks the server for the game the logged-in player left running, and offers to continue it in the main menu. A
	// failed load is tried again a few times: the player must not take a game they can't see for no game.
	async loadSavedGame() {
		const load = ++this.savedGameLoads;
		for (let attempt = 1; attempt <= SAVED_GAME_LOAD_ATTEMPTS; attempt++) {
			try {
				const saved = await loadSavedGame();
				if (load === this.savedGameLoads && this.state === "mainMenu") this.mainMenu.setSavedGame(saved);
				return;
			} catch (error) {
				console.warn("The saved game could not be loaded", error);
				if (attempt === SAVED_GAME_LOAD_ATTEMPTS) return;
				await new Promise((resolve) => setTimeout(resolve, SAVED_GAME_RETRY_DELAY_MS * attempt));
				if (load !== this.savedGameLoads) return;
			}
		}
	}

	forgetSavedGame() {
		this.savedGameLoads++;
		this.mainMenu.setSavedGame(null);
	}

	// Drops the game the player left running, for good.
	concede() {
		if (!this.mainMenu.savedGame) return;
		this.savedGameLoads++;
		this.mainMenu.setSavedGame(null);
		deleteSavedGame();
	}

	continueGame() {
		const saved = this.mainMenu.savedGame;
		if (!saved) return;
		try {
			this.game = Game.resume(saved, this.endGame.bind(this));
		} catch (error) {
			console.warn("The saved game could not be continued", error);
			return;
		}
		this.savedGameLoads++;
		this.mainMenu.setSavedGame(null);
		this.state = "game";
	}

	// A new game wipes the player's saved one first, so it can't survive a save that fails: the shop that starts saves
	// the new game at round 1.
	startNewGame() {
		this.savedGameLoads++;
		this.mainMenu.setSavedGame(null);
		deleteSavedGame();
		this.game = new Game(this.mainMenu.classesSelectorHud.selectedClass, this.endGame.bind(this));
		this.state = "game";
	}

	endGame() {
		this.game = null;
		this.state = "mainMenu";
		// An answer that came during the run was dropped: ask again for what the menu should offer now. It asks nothing of
		// a guest.
		this.loadSavedGame();
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
