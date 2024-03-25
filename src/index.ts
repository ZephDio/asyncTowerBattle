import { InputToIntentTranslator } from "./control/input-to-intent-translator";
import { MouseEventHandler } from "./control/mouse-event-handler";
import { Game } from "./engine/game";
import { CanvasRenderer } from "./renderer/implementation/canvas-renderer";

async function init() {
  const game = new Game();
  const renderer = new CanvasRenderer(game);
  const inputToIntentTranslator = new InputToIntentTranslator(renderer);
  const mouseEventHandler = new MouseEventHandler(renderer, inputToIntentTranslator);

  game.startShop();
  renderer.init();
}

init();
