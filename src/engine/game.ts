import {
  GetTowersEntitiesQuery,
  GetTowersEntitiesQueryHandler,
} from "./tower/application/query/get-towers-query";
import { Battle } from "./battle/battle";
import { Army, ArmyFixture } from "./army/army";
import { GameState } from "../shared/gamestate";
import { CastleEntityFixture } from "./castle/domain/castle";
import { PathFixture } from "./path/domain/path";

export class Game {
  army = new Army(
    CastleEntityFixture.allied,
    [],
    PathFixture.defaultAllied,
    []
  );
  battle = null as null | Battle;
  constructor() {}

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
      console.log(battleState);
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
