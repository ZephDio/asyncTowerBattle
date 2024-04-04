import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HaveStats } from "../../engine/stats/stats";

export class Cast {
	progress = 0;
	constructor(
		private readonly caster: ImplementsTrait<typeof Caster>,
		private readonly resolve: () => void,
	) {}

	tick() {
		this.progress += this.caster.castSpeed;
		if (this.progress >= 100) {
			this.resolve();
		}
	}
}

export const Caster = Subtrait([HaveStats], (base) => {
	abstract class ICaster extends base {
		cast = null as null | Cast;

		abstract onCastResolve(): void;

		tickCast() {
			if (this.cast) {
				return this.cast.tick();
			}
			this.cast = new Cast(this, () => this.onCastResolve());
		}

		get castSpeed() {
			return this.stats.castSpeed;
		}
	}

	return ICaster;
});
