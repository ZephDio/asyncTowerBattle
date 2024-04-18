import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { HaveStats } from "../../../engine/stats/stats";

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

export const Caster = Subtrait([HaveStats], (base, _props) => {
	abstract class ICaster extends base {
		constructor(props: { casterRecruit: ImplementsTrait<typeof RecruitCaster> } & typeof _props) {
			super(props);
		}
		castInProgress = null as null | Cast;
		subscribers: Set<{ subscriber: any; callback: () => void }> = new Set();

		abstract casts(): void;

		callSubscribers() {
			for (const { callback } of this.subscribers) {
				callback();
			}
		}

		tickCast() {
			if (this.castInProgress) {
				return this.castInProgress.tick();
			}
			this.casts();
		}

		get castSpeed() {
			return this.stats.castSpeed;
		}

		subscribeOnCast(subscriber: any, callback: () => void) {
			this.subscribers.add({ subscriber, callback });
		}
	}

	return ICaster;
});

export const RecruitCaster = Trait((base) => {
	abstract class IRecruitCaster extends base {
		instantiateCaster = true;
	}
	return IRecruitCaster;
});
