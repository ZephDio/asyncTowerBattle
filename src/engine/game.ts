import { Battle } from "./battle/battle";
import { BattleState, GameState, ShopState, SummaryState } from "../shared/gamestate";
import { BattleSummary } from "./battle-summary/battle-summary";
import { ArmyFactory } from "./army/army-fixtures";
import { EconomyHooks, ShopPhase } from "./shop/shop";
import { LocalMatchMaker } from "./match-maker/local-match-maker";
import { MatchMaker } from "./match-maker/match-maker";
import { RoundsTracker } from "./rounds/tracker";
import { DescriptionHud } from "../shared/traits/render/huds/item-descriptor";
import { RenderableState } from "../renderer/renderer";
import { BattleRandomSeed } from "./battle/battle-random-seed";
import { EnvironmentGeneration } from "./environment/env-generation";

export class Game {
	army = ArmyFactory.default;
	battle = null as null | Battle;
	battleSummary: null | BattleSummary = null;
	shop: null | ShopPhase = null;
	rounds = new RoundsTracker(this.army);

	descriptionHud: null | DescriptionHud = null;
	matchMaker: MatchMaker = new LocalMatchMaker();
	economy = {
		gold: 99999,
	};

	constructor() {
		const envGenerator = new EnvironmentGeneration();
		envGenerator.generateEnvironment(this.army.grid, 0);
	}

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
		this.rounds.update();
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
		let state = null as null | RenderableState;
		if (this.battle) {
			state = this.battle.getDrawables();
		}
		if (this.battleSummary) {
			state = this.battleSummary.getDrawables();
		}
		if (this.shop) {
			state = this.shop!.getDrawables();
		}
		if (!state) throw new Error("No state found");
		if (this.descriptionHud) state!.renderables.push(this.descriptionHud);
		return state;
	}

	startShop() {
		this.shop = new ShopPhase(
			this.army,
			this.handleShopQuit.bind(this),
			this.setDescriptionHud.bind(this),
			this.getEconomyHooks(),
		);
		this.addGold(20);
	}

	startBattleSummary(lastBattleState: BattleState, battleVerdict: "victory" | "defeat") {
		this.battleSummary = new BattleSummary(lastBattleState, battleVerdict, this.handleSummaryQuit.bind(this));
	}

	startBattle() {
		const { army, randomSeed } = this.matchMaker.getOpponent(this.rounds.round);
		this.battle = new Battle(
			this.army,
			army,
			new BattleRandomSeed(randomSeed),
			this.handleEndBattle.bind(this),
			this.setDescriptionHud.bind(this),
		);
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

	setDescriptionHud(descriptionHud: DescriptionHud | null) {
		this.descriptionHud = descriptionHud;
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
