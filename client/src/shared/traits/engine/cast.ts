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
			this.resolve();
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
