import { InputToIntent } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { GameWrapper } from "./engine/wrap";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";
import { DEBUG_BRIDGE, installDebugBridge } from "./debug/bridge";

async function init() {
	const gameWrap = new GameWrapper();
	const renderer = new CanvasRenderer(gameWrap);
	const inputToIntent = new InputToIntent(gameWrap);
	new MouseEventHandler(renderer, inputToIntent);
	if (DEBUG_BRIDGE) installDebugBridge(gameWrap, renderer);
	renderer.init();
}

init();
