import { secondsToFrame } from "../../shared/seconds";

export type FoodHooks = {
	getFood: () => number;
	addFood: (amount: number) => void;
	consumeFood: (amount: number) => boolean;
	hasHitFamine: () => boolean;
	removeFood: (amount: number) => void;
	addMaxFood: (amount: number) => void;
};

// How long a famine alert lasts once a consumer fails to find enough food.
export const FAMINE_DURATION = secondsToFrame(3);

export class BattleFoodEconomy {
	public food: number = 0;
	// The battle clock at which the current famine alert ends (none while the clock is past it).
	private famineEnd = -Infinity;
	// True from the first famine to the end of the battle, even once the alert is over (the Bakery Wryy reads it).
	private famineHit = false;

	constructor(
		public maxFood: number,
		private getTimer: () => { clock: number },
	) {
		this.food = maxFood;
	}

	isFamine() {
		return this.getTimer().clock < this.famineEnd;
	}

	getFood() {
		return this.food;
	}

	addFood(amount: number) {
		this.food = Math.min(this.food + amount, this.maxFood);
	}

	removeFood(amount: number) {
		this.food -= Math.min(this.food, amount);
	}

	// All or nothing. A consumer that can't pay triggers a famine alert: for FAMINE_DURATION, every consumeFood
	// fails without eating, so the army refills instead of edging at 0 where each payer's luck depended on its order.
	consumeFood(amount: number): boolean {
		if (this.isFamine()) {
			return false;
		}
		if (this.food < amount) {
			this.famineEnd = this.getTimer().clock + FAMINE_DURATION;
			this.famineHit = true;
			return false;
		}
		this.food -= amount;
		return true;
	}

	hasHitFamine() {
		return this.famineHit;
	}

	addMaxFood(amount: number) {
		this.maxFood += amount;
		this.food += amount;
	}

	removeMaxFood(amount: number) {
		this.maxFood -= amount;
		this.food = Math.max(0, this.food - amount);
	}

	getHooks(): FoodHooks {
		return {
			getFood: this.getFood.bind(this),
			addFood: this.addFood.bind(this),
			consumeFood: this.consumeFood.bind(this),
			hasHitFamine: this.hasHitFamine.bind(this),
			removeFood: this.removeFood.bind(this),
			addMaxFood: this.addMaxFood.bind(this),
		};
	}
}
