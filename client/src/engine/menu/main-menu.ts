import { HudElement } from "../../shared/hud-element/hud-element";
import { FactionsSelectorHud as FactionSelectorHud } from "./huds/faction-selector";
import { StartGameButton } from "./huds/start-game-button";
import { ContinueGameButton } from "./huds/continue-game-button";
import { ConcedeButton } from "./huds/concede-button";
import { SavedGame } from "../saved-game/saved-game";
export enum Faction {
	Dwarf = "Dwarf",
	Elf = "Elf",
}

export class MainMenu {
	startGameButton: StartGameButton = new StartGameButton({});
	classesSelectorHud = new FactionSelectorHud();
	// The game the logged-in player left running, which the Continue button reopens.
	savedGame: SavedGame | null = null;
	private continueGameButton = new ContinueGameButton({});
	private concedeButton = new ConcedeButton({});

	setSavedGame(savedGame: SavedGame | null) {
		this.savedGame = savedGame;
	}

	// With a game to continue, Continue takes the place of Start Game and Concede sits under it.
	private get gameButtons() {
		return this.savedGame ? [this.continueGameButton, this.concedeButton] : [this.startGameButton];
	}

	getState(): MainMenuState {
		return {
			hudElements: [
				...this.gameButtons,
				this.classesSelectorHud.selectDwarfButton,
				this.classesSelectorHud.selectElfButton,
			],
		};
	}
	getRenderState() {
		return {
			grids: [],
			renderables: [...this.gameButtons, this.classesSelectorHud],
		};
	}
}

export type MainMenuState = {
	hudElements: HudElement[];
};
