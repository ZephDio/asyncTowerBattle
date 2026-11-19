import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { HaveStats } from "../../../engine/stats/stats";
import { Action } from "../../action";
import { castCostFromFrames } from "../../seconds";

export class Cast extends Action {
	constructor(
		private readonly caster: ImplementsTrait<typeof Caster>,
		resolve: () => void,
		private readonly _cost: number = 960, // 960 is the best number to avoid float numbers, making 30 the cast speed for 1 second
	) {
		super(caster.castSpeed, resolve);
	}

	override tick() {
		this.progress += this.caster.castSpeed;
		if (this.progress >= this._cost) {
			// What goes past the cost is not lost: the caster's next cast starts with it.
			const overflow = this.progress - this._cost;
			this.resolve();
			if (this.caster.castInProgress === this) {
				// The cast resolved without finishing (a tower with no target): it stays ready and retries next tick,
				// instead of piling up progress that the next casts would all spend at once.
				this.progress = this._cost - this.caster.castSpeed;
				this.caster.castOverflow = 0;
				return;
			}
			this.caster.castOverflow = overflow;
		}
	}

	get cost() {
		return this._cost;
	}
}

export const Caster = Subtrait([HaveStats], (base, _props) => {
	abstract class ICaster extends base {
		constructor(props: { casterRecruit: ImplementsTrait<typeof RecruitCaster> } & typeof _props) {
			super(props);
		}
		castInProgress = null as null | Cast;
		/** Progress past the cost of the cast that just resolved, handed to the next cast when it starts right away. */
		castOverflow = 0;
		subscribers: Set<{ subscriber: any; callback: () => void }> = new Set();

		abstract casts(): void;

		callSubscribers() {
			for (const { callback } of this.subscribers) {
				callback();
			}
		}

		get castTime() {
			return castCostFromFrames(this.castSpeed);
		}

		finishCast(sucess: boolean = true) {
			if (sucess) this.callSubscribers();
			this.castInProgress = null;
		}

		tickCast() {
			if (this.castInProgress) {
				return this.castInProgress.tick();
			}
			const overflow = this.castOverflow;
			this.castOverflow = 0;
			this.casts();
			// A cast that starts this tick also progresses this tick, and keeps the previous cast's overflow.
			const started = this.castInProgress as null | Cast;
			if (started) {
				started.progress = overflow;
				started.tick();
			}
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
