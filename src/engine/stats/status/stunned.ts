import { Derive } from "@ddd-ts/traits";
import { secondsToFrame } from "../../../shared/seconds";
import { Stats } from "../stats";
import { Status } from "../../../shared/traits/engine/status";

export class Stunned extends Derive(Status) {
	key = "stunned";
	clock = 0;
	duration = secondsToFrame(1);
	stats: Stats;
	didTrigger = false;
	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this)
		}

		if (this.didTrigger) return;
		this.didTrigger = true;
	}

	stack(status: Stunned) {
		this.duration += status.duration;
	} 

	onRemove() {}
}
