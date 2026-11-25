import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";

// A slow on movement speed. It multiplies the speed, whatever the buffs added to it. Two applications of the same
// slow (same key) do not add up: the strongest percent and the longest remaining time are kept.
export class BoggedDown extends Derive(Status) {
	key: string = "boggedDown";
	clock = 0;
	duration: number;
	stats: Stats;
	didTrigger = false;
	percent: number;

	constructor({ duration = 3, percent = 30 }: { duration?: number; percent?: number } = {}) {
		super({});
		this.duration = duration;
		this.percent = percent;
	}

	tick() {
		this.clock++;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
			return;
		}
		if (this.didTrigger) return;
		this.stats.setModifier("movementSpeed", this.key, -this.percent);
		this.didTrigger = true;
	}

	stack(status: BoggedDown) {
		const remaining = Math.max(this.duration - this.clock, status.duration - status.clock);
		this.duration = remaining;
		this.clock = 0;
		this.percent = Math.max(this.percent, status.percent);
		if (this.didTrigger) this.stats.setModifier("movementSpeed", this.key, -this.percent);
	}

	onRemove() {
		this.stats.clearModifier("movementSpeed", this.key);
	}
}
