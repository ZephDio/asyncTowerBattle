import { BattleSummary } from "../../engine/battle-summary/battle-summary";
import { HideHud } from "../../engine/battle-summary/huds/hide-hud";
import { NextRoundHud } from "../../engine/battle-summary/huds/next-round-hud";
import { SummaryState } from "../../shared/gamestate";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { BattleInputToIntentTranslator } from "./battle-input-translator";

export class BattleSummaryInputToIntentTranslator {

	constructor(private battleTranslator: BattleInputToIntentTranslator) {}
	
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, summary: BattleSummary) {
		const state = summary.getState()
		if(state.hidden){
			this.battleTranslator.handle(screenPosition, eventType, summary.battle)
		}
		const focus = this.determinateFocus(screenPosition, state);
		if (eventType === "down") {
			this.handleMouseDownInput(screenPosition, focus, summary)
		}
	}

	handleMouseDownInput(screenPosition: ScreenPosition, focus:ReturnType<BattleSummaryInputToIntentTranslator["determinateFocus"]> ,summary: BattleSummary){
		if(focus instanceof HideHud){
			summary.toggleHide()
		}
		if(focus instanceof NextRoundHud){
			summary.quitSummary()
		}
	}

	determinateFocus(screenPosition: ScreenPosition, state: SummaryState){ 
		for (const hudElement of state.hudElements) {
			if(hudElement instanceof HideHud && hudElement.contains(screenPosition)){
				return hudElement
			}
			if(hudElement instanceof NextRoundHud && hudElement.contains(screenPosition)){
				return hudElement
			}
		}
		return undefined;
	}
}
