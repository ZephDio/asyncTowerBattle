import { StartGameButton } from "./huds/start-game-button";

export class MainMenu {
	startGameButton: StartGameButton = new StartGameButton({});

	getState(): MainMenuState {
		return {
			hudElements: [this.startGameButton],
		};
	}
	getRenderState() {
		return {
			grids: [],
			renderables: [this.startGameButton],
		};
	}
}

export type MainMenuState = {
	hudElements: StartGameButton[];
};
