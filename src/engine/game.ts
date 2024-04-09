import { Battle } from "./battle/battle";
import { BattleState, GameState, ShopState, SummaryState } from "../shared/gamestate";
import { BattleSummary } from "./battle-summary/battle-summary";
import { ArmyFixture } from "./army/army-fixtures";
import { EconomyHooks, ShopPhase } from "./shop/shop";

export class Game {
	army = ArmyFixture.allied;
	battle = null as null | Battle;
	battleSummary: null | BattleSummary = null;
	shop: null | ShopPhase = null;
	enemyArmy = ArmyFixture.enemy;
	economy = {
		gold: 0,
	};

	constructor() {}

	async getState(): Promise<GameState> {
		if (this.battle) return this.getBattleState();
		if (this.battleSummary) return this.getSummaryState();
		return this.getShopState();
	}

	getBattleState() {
		if (!this.battle) return {} as BattleState;
		const state = this.battle.getState();
		return state;
	}

	getSummaryState() {
		if (!this.battleSummary) return {} as SummaryState;
		return this.battleSummary.getState();
	}

	getShopState() {
		if (!this.shop) return {} as ShopState;
		return this.shop.getState();
	}

	handleEndBattle(battleVerdict: "victory" | "defeat") {
		const lastBattleState = this.getBattleState();
		this.startBattleSummary(lastBattleState, battleVerdict);
		this.battle = null;
	}

	handleSummaryQuit() {
		this.battleSummary = null;
		this.startShop();
	}

	handleShopQuit() {
		this.shop = null;
		this.startBattle();
	}

	getRenderState() {
		if (this.battle) return this.battle.getDrawables();
		if (this.battleSummary) return this.battleSummary.getDrawables();
		return this.shop!.getDrawables();
	}

	startShop() {
		this.shop = new ShopPhase(this.army, this.handleShopQuit.bind(this), this.getEconomyHooks());
		this.addGold(20);
	}

	startBattleSummary(lastBattleState: BattleState, battleVerdict: "victory" | "defeat") {
		this.battleSummary = new BattleSummary(lastBattleState, battleVerdict, this.handleSummaryQuit.bind(this));
	}

	startBattle() {
		this.battle = new Battle(this.army, this.enemyArmy, this.handleEndBattle.bind(this));
		this.battle.start();
	}

	getEconomy() {
		return this.economy;
	}

	spendGold(amount: number) {
		this.economy.gold -= amount;
	}

	addGold(amount: number) {
		this.economy.gold += amount;
	}

	getEconomyHooks(): EconomyHooks {
		return {
			getEconomy: this.getEconomy.bind(this),
			spendGold: this.spendGold.bind(this),
			addGold: this.addGold.bind(this),
			canPurchase: (price: number) => this.economy.gold >= price,
		};
	}
}
