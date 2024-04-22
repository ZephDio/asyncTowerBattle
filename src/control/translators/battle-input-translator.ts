import { implementsTrait } from "@ddd-ts/traits";
import { Battle } from "../../engine/battle/battle";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { DescriptionHud, TDescriptor } from "../../shared/traits/render/huds/item-descriptor";
import { BattleState } from "../../shared/gamestate";
import { SliderBattleSpeed } from "../../shared/hud-element/battle/slider-speed";

export class BattleInputToIntentTranslator {
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, battle: Battle) {
		const state = battle.getState();
		const focus = this.determinateFocus(screenPosition, state);
		if (eventType === "move" && battle.speedCursor.focused) {
			battle.speedCursor.moveCursor(screenPosition);
		}
		if (eventType === "up") {
			battle.speedCursor.focused = false;
		}
		if (!focus) {
			battle.setDescriptionHud(null);
			return;
		}
		if (focus instanceof SliderBattleSpeed && eventType === "down") {
			battle.speedCursor.focused = true;
			return battle.speedCursor.moveCursor(screenPosition);
		}
		if (implementsTrait(focus, TDescriptor) && eventType === "move") {
			return battle.setDescriptionHud(new DescriptionHud(focus));
		}
	}

	determinateFocus(screenPosition: ScreenPosition, state: BattleState) {
		for (const hudElement of state.hudElements) {
			if (hudElement instanceof SliderBattleSpeed && hudElement.contains(screenPosition)) {
				return hudElement;
			}
		}
		const grid = state.grid;
		const gridPosition = grid.screenToGridPosition(screenPosition);
		const cell = grid.gridPositionToCell(gridPosition);
		if (cell) {
			const gridElement = grid.getElement(cell);
			if (gridElement) {
				return gridElement;
			}
		}
		return undefined;
	}
}
