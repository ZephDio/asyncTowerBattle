import { GameLink, InputToIntent } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { GameWrapper } from "./engine/wrap";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";
import { installDebugBridge } from "./debug/bridge";
import { DEBUG_BRIDGE } from "./debug/debug-flag";

// Returns the page shell's link to the game.
export function startGame(container: HTMLElement, canvas: HTMLCanvasElement): GameLink {
	const gameWrap = new GameWrapper();
	const renderer = new CanvasRenderer(gameWrap, container, canvas);
	const inputToIntent = new InputToIntent(gameWrap);
	new MouseEventHandler(renderer, inputToIntent);
	if (DEBUG_BRIDGE) installDebugBridge(gameWrap, renderer);
	renderer.init();
	return {
		send: (intent) => inputToIntent.handleIntent(intent),
		onTutorialChange: (listener) => gameWrap.onTutorialChange(listener),
	};
}
