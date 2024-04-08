import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HaveStats } from "../../engine/stats/stats";

export class Cast {
	progress = 0;
	constructor(
		private readonly caster: ImplementsTrait<typeof Caster>,
		private readonly resolve: () => void,

		private readonly castCost: number,
	) {}

	tick() {
		this.progress += this.caster.castSpeed;
		if (this.progress >= this.castCost) {
			this.resolve();
		}
	}
}

export const Caster = Subtrait([HaveStats], (base) => {
	abstract class ICaster extends base {
		castInProgress = null as null | Cast;

		abstract casts(): void;

		tickCast() {
			if (this.castInProgress) {
				return this.castInProgress.tick();
			}
			this.casts();
		}

		get castSpeed() {
			return this.stats.castSpeed;
		}
	}

	return ICaster;
});
