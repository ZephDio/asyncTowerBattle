import { Battle } from "./battle/battle";
import { BattleState, GameState, SummaryState } from "../shared/gamestate";
import { BattleSummary, BattleVerdict } from "./battle-summary/battle-summary";
import { ArmyFixture } from "./army/entity/army-fixtures";

export class Game {
  // army = new Army(
  //   CastleEntityFixture.allied,
  //   [],
  //   PathFixture.defaultAllied,
  //   [BarracksFixture.soldier]
  // );
  army = ArmyFixture.allied;
  battle = null as null | Battle;

  battleSummary: null | BattleSummary = null;
  constructor() {}

  async getState(): Promise<GameState> {
    if (this.battle) {
      return this.getBattleState();
    }
    return this.getSummaryState();
  }

  getBattleState() {
    if (!this.battle) return {} as BattleState;
    return this.battle.getState();
  }

  getSummaryState() {
    if (!this.battleSummary) return {} as SummaryState;
    return this.battleSummary.getState();
  }

  handleEndBattle(battleVerdict: BattleVerdict) {
    const lastBattleState = this.getBattleState();
    this.battleSummary = new BattleSummary(
      lastBattleState,
      battleVerdict,
      this.handleSummaryQuit.bind(this)
    );
    this.battle = null;
  }

  handleSummaryQuit() {
    this.battleSummary = null;
    this.startBattle();
  }

  startBattle() {
    this.battle = new Battle(
      ArmyFixture.allied,
      ArmyFixture.enemy,
      this.handleEndBattle.bind(this)
    );
    this.battle.start();
  }
}
