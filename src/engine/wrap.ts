import { Game } from "./game";
import { MainMenu } from "./menu/main-menu";

export class GameWrapper {
	state: "game" | "mainMenu" = "mainMenu";
	game = null as null | Game;
	mainMenu: MainMenu;
	constructor() {
		this.mainMenu = new MainMenu();
	}

	startNewGame() {
		this.game = new Game();
		this.state = "game";
	}

	getRenderState() {
		if (this.state === "game" && this.game) return this.game.getRenderState();
		if (this.mainMenu) return this.mainMenu.getRenderState();
		throw new Error("GameWrapper.getRenderState: invalid state");
	}
}
