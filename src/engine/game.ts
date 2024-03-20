import { Battle } from "./battle/battle";
import { ArmyFixture } from "./army/army";
import { GameState } from "../shared/gamestate";

export class Game {
  // army = new Army(
  //   CastleEntityFixture.allied,
  //   [],
  //   PathFixture.defaultAllied,
  //   [BarracksFixture.soldier]
  // );
  army = ArmyFixture.allied
  battle = null as null | Battle;
  constructor() { }

  async getState(): Promise<GameState> {
    if (this.battle) {
      const battleState = {
        castles: [this.battle.alliedArmy.castle, this.battle.enemyArmy.castle],
        towers: [
          ...this.battle.alliedArmy.towers,
          ...this.battle.enemyArmy.towers,
        ],
        paths: [this.battle.alliedArmy.path, this.battle.enemyArmy.path],
        enemyEntities: [...this.battle.physics.units],
      };
      return battleState;
    }
    return {} as GameState;
  }

  handleEndBattle(battleStatus: "victory" | "defeat") {
    if (battleStatus === "victory") {
    }
    if (battleStatus === "defeat") {
    }
    this.battle = null;
  }

  async startBattle() {
    this.battle = new Battle(
      ArmyFixture.allied,
      ArmyFixture.enemy,
      this.handleEndBattle
    );
    this.battle.start();
  }
}
