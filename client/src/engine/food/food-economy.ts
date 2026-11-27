import { maxFood } from "../rounds/round-scaling";
import { BattleFoodEconomy } from "./battle-food-economy";

export class ArmyFoodEconomy {
	maxFood: number = maxFood(1);

	constructor() {}

	toBattle(getTimer: () => { clock: number }) {
		return new BattleFoodEconomy(this.maxFood, getTimer);
	}

	setRound(round: number) {
		this.maxFood = maxFood(round);
	}

	addMaxFood(amount: number) {
		this.maxFood += amount;
	}

	removeMaxFood(amount: number) {
		this.maxFood -= amount;
	}
}
