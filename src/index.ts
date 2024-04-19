import { InputToIntent } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";

async function init() {
	const game = new Game();
	const renderer = new CanvasRenderer(game);

	const inputToIntent = new InputToIntent(game);
	new MouseEventHandler(renderer, inputToIntent);
	game.startShop();
	renderer.init();
}

init();
