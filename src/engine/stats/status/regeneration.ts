import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";

// Heals a little every tick for a few ticks. Getting it again while it runs only restarts its duration, so a unit
// standing in several healing sources at once is healed once per tick.
export class Regeneration extends Derive(Status) {
	key = "regeneration" as const;
	clock = 0;
	stats: Stats;

	constructor(
		public heal: number,
		public duration: number,
	) {
		super({});
	}

	tick() {
		this.stats.heal(this.heal);
		if (++this.clock >= this.duration) this.stats.removeBoon(this);
	}

	stack(_status: Regeneration) {
		this.clock = 0;
	}

	onRemove() {}
}
