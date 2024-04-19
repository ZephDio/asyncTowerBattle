import { BattleFoodEconomy } from "./battle-food-economy";

export class ArmyFoodEconomy {
	maxFood = 100;

	constructor() {}

	toBattle() {
		return new BattleFoodEconomy(this.maxFood);
	}

	addMaxFood(amount: number) {
		this.maxFood += amount;
	}

	removeMaxFood(amount: number) {
		this.maxFood -= amount;
	}
}
