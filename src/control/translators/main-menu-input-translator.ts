import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { MainMenu, MainMenuState } from "../../engine/menu/main-menu";
import { StartGameButton } from "../../engine/menu/huds/start-game-button";
import { GameWrapper } from "../../engine/wrap";

export class MainMenuInputToIntentTranslator {
	constructor(public gameWrapper: GameWrapper) {}
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, menu: MainMenu) {
		const state = menu.getState();
		const focus = this.determinateFocus(screenPosition, state);
		if (eventType === "down") {
			this.handleMouseDown(menu, focus, screenPosition);
			return;
		}
	}

	handleMouseDown(
		_menu: MainMenu,
		focus: ReturnType<MainMenuInputToIntentTranslator["determinateFocus"]>,
		_screenPosition: ScreenPosition,
	) {
		if (focus instanceof StartGameButton) {
			this.gameWrapper.startNewGame();
		}
	}

	determinateFocus(screenPosition: ScreenPosition, state: MainMenuState) {
		for (const hudElement of state.hudElements) {
			if (hudElement instanceof StartGameButton && hudElement.contains(screenPosition)) {
				return hudElement;
			}
		}
		return undefined;
	}
}
