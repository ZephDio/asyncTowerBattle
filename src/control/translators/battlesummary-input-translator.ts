import { BattleSummary } from "../../engine/battle-summary/battle-summary";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";

export class BattleSummaryInputToIntentTranslator {
	handle(_screenPosition: ScreenPosition, eventType: MouseEventType, summary: BattleSummary) {
		if (eventType === "down") {
			summary.quitSummary();
		}
	}
}
