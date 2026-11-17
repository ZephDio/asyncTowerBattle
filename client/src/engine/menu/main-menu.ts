import { HudElement } from "../../shared/hud-element/hud-element";
import { FactionsSelectorHud as FactionSelectorHud } from "./huds/faction-selector";
import { StartGameButton } from "./huds/start-game-button";
export enum Faction {
	Dwarf = "Dwarf",
	Elf = "Elf",
}

export class MainMenu {
	startGameButton: StartGameButton = new StartGameButton({});
	classesSelectorHud = new FactionSelectorHud();
	getState(): MainMenuState {
		return {
			hudElements: [
				this.startGameButton,
				this.classesSelectorHud.selectDwarfButton,
				this.classesSelectorHud.selectElfButton,
			],
		};
	}
	getRenderState() {
		return {
			grids: [],
			renderables: [this.startGameButton, this.classesSelectorHud], //
		};
	}
}

export type MainMenuState = {
	hudElements: HudElement[];
};
