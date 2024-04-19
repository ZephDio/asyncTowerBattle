export type FoodHooks = {
	getFood: () => number;
	addFood: (amount: number) => void;
	consumeFood: (amount: number) => boolean;
	removeFood: (amount: number) => void;
};

export class BattleFoodEconomy {
	public food: number = 0;
	constructor(public maxFood: number) {
		this.food = maxFood;
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

	consumeFood(amount: number): boolean {
		if (this.food < amount) {
			return false;
		}
		this.food -= amount;
		return true;
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
			removeFood: this.removeFood.bind(this),
		};
	}
}
