import { Battle } from "./battle/battle";
import { BattleState, GameState, ShopState, SummaryState } from "../shared/gamestate";
import { BattleSummary, BattleVerdict } from "./battle-summary/battle-summary";
import { ArmyFixture } from "./army/entity/army-fixtures";
import { Shop } from "./shop/shop";

export class Game {
  army = ArmyFixture.allied;
  battle = null as null | Battle;
  battleSummary: null | BattleSummary = null;
  shop: null | Shop = null;
  enemyArmy = ArmyFixture.enemy

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

  handleEndBattle(battleVerdict: BattleVerdict) {
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

  startShop() {
    this.shop = new Shop(this.army, this.handleShopQuit.bind(this));
  }

  startBattleSummary(lastBattleState: BattleState, battleVerdict: BattleVerdict) {
    this.battleSummary = new BattleSummary(lastBattleState, battleVerdict, this.handleSummaryQuit.bind(this));
  }

  startBattle() {
    this.battle = new Battle(this.army, this.enemyArmy, this.handleEndBattle.bind(this));
    this.battle.start();
  }
}
