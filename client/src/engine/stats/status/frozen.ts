import { Derive } from "@ddd-ts/traits";
import { Status } from "../../../shared/traits/engine/status";
import { Stats } from "../stats";

export class Frozen extends Derive(Status) {
	key = "frozen" as const;
	override clock: number = 0;
	override stats: Stats;

	constructor(
		public duration: number,
		public intensity: number,
	) {
		super({});
	}

	override stack(_status: Frozen): void {}

	// The slow is full on the first tick and fades out linearly over the duration
	tick() {
		this.clock++;
		this.stats.setModifier("movementSpeed", this.key, -this.intensity * (1 - this.clock / this.duration));
		if (this.clock >= this.duration) {
			this.stats.removeCondition(this);
		}
	}

	override onRemove(): void {
		this.stats.clearModifier("movementSpeed", this.key);
	}
}
