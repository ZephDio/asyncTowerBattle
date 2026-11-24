import { HudElement } from "../../shared/hud-element/hud-element";
import { FactionsSelectorHud as FactionSelectorHud } from "./huds/faction-selector";
import { StartGameButton } from "./huds/start-game-button";
import { ContinueGameButton } from "./huds/continue-game-button";
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

	setSavedGame(savedGame: SavedGame | null) {
		this.savedGame = savedGame;
	}

	private get continueButtons() {
		return this.savedGame ? [this.continueGameButton] : [];
	}

	getState(): MainMenuState {
		return {
			hudElements: [
				this.startGameButton,
				...this.continueButtons,
				this.classesSelectorHud.selectDwarfButton,
				this.classesSelectorHud.selectElfButton,
			],
		};
	}
	getRenderState() {
		return {
			grids: [],
			renderables: [this.startGameButton, ...this.continueButtons, this.classesSelectorHud],
		};
	}
}

export type MainMenuState = {
	hudElements: HudElement[];
};
