import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { Faction, MainMenu, MainMenuState } from "../../engine/menu/main-menu";
import { StartGameButton } from "../../engine/menu/huds/start-game-button";
import { GameWrapper } from "../../engine/wrap";
import { SelectElfButton } from "../../engine/menu/huds/select-elf-button";
import { SelectDwarfButton } from "../../engine/menu/huds/select-dwarf-button";

export class MainMenuInputToIntentTranslator {
	constructor(public gameWrapper: GameWrapper) {}
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, menu: MainMenu) {
		const state = menu.getState();
		const focus = this.determinateFocus(screenPosition, state);
		if (eventType === "up") {
			this.handleMouseUp(menu, focus, screenPosition);
			return;
		}
	}

	handleMouseUp(
		_menu: MainMenu,
		focus: ReturnType<MainMenuInputToIntentTranslator["determinateFocus"]>,
		_screenPosition: ScreenPosition,
	) {
		if (focus instanceof StartGameButton) {
			this.gameWrapper.startNewGame();
		}
		if (focus instanceof SelectElfButton) {
			this.gameWrapper.mainMenu.classesSelectorHud.changeClass(Faction.Elf);
		}
		if (focus instanceof SelectDwarfButton) {
			this.gameWrapper.mainMenu.classesSelectorHud.changeClass(Faction.Dwarf);
		}
	}

	determinateFocus(screenPosition: ScreenPosition, state: MainMenuState) {
		for (const hudElement of state.hudElements) {
			if (hudElement instanceof StartGameButton && hudElement.contains(screenPosition)) {
				return hudElement;
			}
			if (hudElement instanceof SelectElfButton && hudElement.contains(screenPosition)) {
				return hudElement;
			}
			if (hudElement instanceof SelectDwarfButton && hudElement.contains(screenPosition)) {
				return hudElement;
			}
		}
		return undefined;
	}
}
