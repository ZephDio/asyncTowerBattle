import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";

export class Frozen extends Derive(Status) {
	key = "frozen" as const;
	override clock: number = 0;
	override stats: Stats;

	hasTriggered = false;

	constructor(
		public duration: number,
		public intensity: number,
	) {
		super({});
	}

	override stack(_status: Frozen): void {}

	tick() {
		if (!this.hasTriggered) {
			this.stats.basePercentStat.movementSpeed -= this.intensity;
			this.hasTriggered = true;
		}
		this.clock++;
		this.stats.basePercentStat.movementSpeed += this.intensity / this.duration;
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}
	}

	override onRemove(): void {
		const remainingTime = this.duration - this.clock;
		this.stats.basePercentStat.movementSpeed += (this.intensity / this.duration) * remainingTime;
	}
}
