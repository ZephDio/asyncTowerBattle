import { BattleFoodEconomy } from "./battle-food-economy";

export class ArmyFoodEconomy {
	maxFood = 100;

	constructor() {}

	toBattle(getTimer: () => { clock: number }) {
		return new BattleFoodEconomy(this.maxFood, getTimer);
	}

	addMaxFood(amount: number) {
		this.maxFood += amount;
	}

	removeMaxFood(amount: number) {
		this.maxFood -= amount;
	}
}
