import { BattleState, SummaryState } from "../../shared/gamestate";
import { Game } from "../game";

export type BattleVerdict = "victory" | "defeat";
export class BattleSummary {
	constructor(
		public lastBattleState: BattleState,
		public battleVerdict: BattleVerdict,

		public onSummaryQuit: Game["handleSummaryQuit"],
	) {}

	getState(): SummaryState {
		const summaryState: SummaryState = {
			type: "summary",
			battleVerdict: this.battleVerdict,
		};
		return summaryState;
	}

	quitSummary() {
		this.onSummaryQuit();
	}
}
