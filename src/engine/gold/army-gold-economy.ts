import { DEV_START } from "../../shared/dev-start";

export class ArmyGoldEconomy {
	golds = {
		amount: DEV_START ? 10000 : 80,
	};

	spendGold(amount: number) {
		this.golds.amount -= amount;
	}

	addGold(amount: number) {
		this.golds.amount += amount;
	}

	canPurchase(price: number) {
		return this.golds.amount >= price;
	}

	getEconomy() {
		return this.golds;
	}

	getHooks(): EconomyHooks {
		return {
			getEconomy: this.getEconomy.bind(this),
			spendGold: this.spendGold.bind(this),
			addGold: this.addGold.bind(this),
			canPurchase: (price: number) => this.golds.amount >= price,
		};
	}
}
export type EconomyHooks = {
	getEconomy: () => { amount: number };
	canPurchase: (price: number) => boolean;
	addGold: (amount: number) => void;
	spendGold: (amount: number) => void;
};
