import { GameLink, InputToIntent } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { GameWrapper } from "./engine/wrap";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";
import { installDebugBridge } from "./debug/bridge";
import { DEBUG_BRIDGE } from "./debug/debug-flag";

export type RunningGame = { link: GameLink; stop: () => void };

// Returns the page shell's link to the game and what ends it: the draw loop, the input listeners and the debug bridge.
export function startGame(container: HTMLElement, canvas: HTMLCanvasElement): RunningGame {
	const gameWrap = new GameWrapper();
	const renderer = new CanvasRenderer(gameWrap, container, canvas);
	const inputToIntent = new InputToIntent(gameWrap);
	const mouse = new MouseEventHandler(renderer, inputToIntent);
	const removeBridge = DEBUG_BRIDGE ? installDebugBridge(gameWrap, renderer) : undefined;
	renderer.init();
	return {
		link: {
			send: (intent) => inputToIntent.handleIntent(intent),
			onTutorialChange: (listener) => gameWrap.onTutorialChange(listener),
		},
		stop: () => {
			renderer.stop();
			mouse.dispose();
			removeBridge?.();
		},
	};
}
