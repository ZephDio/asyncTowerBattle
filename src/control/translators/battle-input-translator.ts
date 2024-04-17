import { implementsTrait } from "@ddd-ts/traits";
import { Battle } from "../../engine/battle/battle";
import { ButtonSpeedHUD } from "../../shared/hud-element/battle/button-speed";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { DescriptionHud, TDescriptor } from "../../shared/traits/render/huds/item-descriptor";
import { BattleState } from "../../shared/gamestate";

export class BattleInputToIntentTranslator {
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, battle: Battle) {
		const state = battle.getState();
		const focus = this.determinateFocus(screenPosition, state);
		if (!focus) {
			battle.setDescriptionHud(null);
		}
		if (focus instanceof ButtonSpeedHUD && eventType === "down") {
			return battle.changeSpeed(focus.speed);
		}
		if (implementsTrait(focus, TDescriptor) && eventType === "move") {
			return battle.setDescriptionHud(new DescriptionHud(focus));
		}
	}

	determinateFocus(screenPosition: ScreenPosition, state: BattleState) {
		for (const hudElement of state.hudElements) {
			if (hudElement instanceof ButtonSpeedHUD && hudElement.contains(screenPosition)) {
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
