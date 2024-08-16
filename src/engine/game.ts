import { Battle } from "./battle/battle";
import { BattleState, GameState, ShopState, SummaryState } from "../shared/gamestate";
import { BattleSummary } from "./battle-summary/battle-summary";
import { ShopPhase } from "./shop/shop";
import { LocalMatchMaker } from "./match-maker/local-match-maker";
import { MatchMaker } from "./match-maker/match-maker";
import { RoundsTracker } from "./rounds/tracker";
import { DescriptionHud } from "../shared/traits/render/huds/item-descriptor";
import { RenderableState } from "../renderer/renderer";
import { BattleRandomSeed } from "./battle/battle-random-seed";
import { EnvironmentGeneration } from "./environment/env-generation";
import { Faction } from "./menu/main-menu";
import { Army } from "./army/army";
import { ArmyFactory } from "./army/army-fixtures";
import { TranslateAnimation } from "./translate-animation/translate-animation";
import { PercentToReal } from "../renderer/implementation/canvas-renderer";

export class Game {
	army: Army;
	battle = null as null | Battle;
	battleSummary: null | BattleSummary = null;
	shop: null | ShopPhase = null;
	rounds: RoundsTracker;
	life = 5;

	descriptionHud: null | DescriptionHud = null;
	matchMaker: MatchMaker = new LocalMatchMaker();
	constructor(
		public chosenClass: Faction,
		private endGame: () => void,
	) {
		this.army = ArmyFactory.default(chosenClass);
		const envGenerator = new EnvironmentGeneration();
		this.rounds = new RoundsTracker(this.army, envGenerator);
		this.startShop();
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

	handleEndBattle(battleVerdict: "Victory" | "Defeat", battle: Battle) {
		if (battleVerdict === "Defeat") {
			this.life--;
		}
		this.startBattleSummary(battle, battleVerdict);
		this.battle = null;
	}

	handleSummaryQuit() {
		this.battleSummary = null;
		const animation = new TranslateAnimation(20, this.army.grid.centerPosition, PercentToReal({ x: 35, y: 28 }) , this.army.grid.centerPosition.clone(), ()=> {this.army.grid.updateCornerPosition()},()=> {this.army.grid.updateCornerPosition()})
		animation.startAnimation()
		if(this.life === 0){
			this.endGame()
		}
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
		this.rounds.update();
		this.shop = new ShopPhase(this.army, this.handleShopQuit.bind(this), this.setDescriptionHud.bind(this));
		this.army.getEconomyHooks().addGold(20 + 5 * this.rounds.round);
		this.army.onShopEnter();
	}

	startBattleSummary(battle: Battle, battleVerdict: "Victory" | "Defeat") {
		this.battleSummary = new BattleSummary(battle, battleVerdict, this.handleSummaryQuit.bind(this), this.life);
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
		this.battle.init();
	}

	setDescriptionHud(descriptionHud: DescriptionHud | null) {
		this.descriptionHud = descriptionHud;
	}
}
