import { Derive } from "@ddd-ts/traits";
import { StackableStatus } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";

export class BoggedDown extends Derive(StackableStatus) {
	key = "boggedDown" as const;
	clock = 0;
	duration = 3;
	stats: Stats;
	didTrigger = false;
	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}

		if (this.didTrigger) return;
		this.stats.basePercentStat.movementSpeed -= 30;
		this.didTrigger = true;
	}

	stack(status: BoggedDown) {
		this.clock = Math.min(this.clock, status.clock);
		this.duration = Math.max(this.duration, status.duration);
	}

	onRemove() {
		this.stats.basePercentStat.movementSpeed += 30;
	}
}
