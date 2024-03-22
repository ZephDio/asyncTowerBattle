import { BattleState } from "../../shared/gamestate";
import { Army } from "../army/entity/army";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleVerdict } from "../battle-summary/battle-summary";
import { Game } from "../game";
import { Path } from "../path/entity/path";
import { BattleCastle } from "../castle/battle/battle-castle";
import { Battlefield } from "./battlefield/battlefield";
import { SoldierBarrack } from "../barrack/entity/implementation/solider-barrack";

export class Battle {
  battlefield: Battlefield;
  isOver = false;
  constructor(public alliedArmy: Army, public enemyArmy: Army, public onBattleOver: Game["handleEndBattle"]) {
    this.battlefield = new Battlefield(this.alliedArmy, this.enemyArmy);
  }

  start() {
    const loop = () => {
      setTimeout(() => {
        if (this.isOver) return;
        this.tick();
        loop();
      }, 30);
    };
    loop();
  }

  // checkVictoryCondition(): BattleVerdict | "onGoing" {
  //   if (this.enemyArmy.castle.actualLife <= 0) {
  //     return "victory";
  //   }
  //   if (this.alliedArmy.castle.actualLife <= 0) {
  //     return "defeat";
  //   }
  //   return "onGoing";
  // }

  tick() {
    this.battlefield.tick();
    // const isOver = this.checkVictoryCondition();
    // if (isOver === "onGoing") {
    // } else {
    //   this.onBattleOver(isOver);
    //   this.isOver = true;
    // }
  }

  getState(): BattleState {
    const battleState: BattleState = {
      type: "battle",
      castles: [this.battlefield.alliedArmy.castle, this.battlefield.enemyArmy.castle],
      towers: [...this.battlefield.alliedArmy.towers, ...this.battlefield.enemyArmy.towers],
      paths: [this.battlefield.alliedArmy.path, this.battlefield.enemyArmy.path],
      entities: [...this.battlefield.units],
      projectiles: [...this.battlefield.projectiles],
    };
    return battleState;
  }
}
