import { HudElement } from "../../shared/hud-element/hud-element";
import { ClassesSelectorHud } from "./huds/classes-selector";
import { StartGameButton } from "./huds/start-game-button";
export enum Classes{
	Dwarf = "Dwarf",
	Human = "Human"

}


export class MainMenu {
	startGameButton: StartGameButton = new StartGameButton({});
	classesSelectorHud = new ClassesSelectorHud()
	getState(): MainMenuState {
		return {
			hudElements: [this.startGameButton, this.classesSelectorHud.selectDwarfButton, this.classesSelectorHud.selectHumanButton],
		};
	}
	getRenderState() {
		return {
			grids: [],
			renderables: [ this.startGameButton, this.classesSelectorHud], //
		};
	}
}

export type MainMenuState = {
	hudElements: HudElement[]
};
