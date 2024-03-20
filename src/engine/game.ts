import { Battle } from "./battle/battle";
import { Army, ArmyFixture } from "./army/army";
import { BattleState, GameState, SummaryState } from "../shared/gamestate";
import { CastleEntityFixture } from "./castle/domain/castle";
import { PathFixture } from "./path/domain/path";
import { BattleSummary, BattleVerdict } from "./battle-summary/battle-summary";

export class Game {
  army = new Army(
    CastleEntityFixture.allied,
    [],
    PathFixture.defaultAllied,
    []
  );
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
