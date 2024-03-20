import { BattleState } from "../../shared/gamestate";
import { Army } from "../army/army";
import { BattleArmy } from "../army/battle-army";
import { SoldierBarrack } from "../barrack/soldier-barrack";
import { BattleVerdict } from "../battle-summary/battle-summary";
import { Game } from "../game";
import { Path } from "../path/domain/path";
import { BattleCastle } from "../physic/castle/entity-castle-physic";
import { Physics } from "../physic/physics";

export class Battle {
  alliedArmy: BattleArmy;
  enemyArmy: BattleArmy;
  physics: Physics;
  constructor(
    alliedArmy: Army,
    enemyArmy: Army,
    public onBattleOver: Game["handleEndBattle"]
  ) {
    const alliedCastle = new BattleCastle(alliedArmy.castle);
    const enemyCastle = new BattleCastle(enemyArmy.castle);
    this.alliedArmy = this.buildBattleArmy(
      alliedArmy,
      enemyCastle,
      alliedCastle,
      enemyArmy.path
    );
    this.enemyArmy = this.buildBattleArmy(
      enemyArmy,
      alliedCastle,
      enemyCastle,
      alliedArmy.path
    );
    this.physics = new Physics(this.alliedArmy, this.enemyArmy);
  }

  start() {
    const loop = () => {
      setTimeout(() => {
        this.tick();
        loop();
      }, 31);
    };
    loop();
  }

  checkVictoryCondition(): BattleVerdict | "onGoing" {
    if (this.enemyArmy.castle.actualLife <= 0) {
      return "victory";
    }
    if (this.alliedArmy.castle.actualLife <= 0) {
      return "defeat";
    }
    return "onGoing";
  }

  buildBattleArmy(
    army: Army,
    enemyCastle: BattleCastle,
    alliedCastle: BattleCastle,
    path: Path
  ) {
    return new BattleArmy(
      army,
      enemyCastle,
      alliedCastle,
      army.barracks as SoldierBarrack[]
    );
  }

  tick() {
    const isOver = this.checkVictoryCondition();
    if (isOver === "onGoing") {
      this.physics.tick();
    } else {
      this.onBattleOver(isOver);
    }
  }

  getState(): BattleState {
    const battleState: BattleState = {
      type: "battle",
      castles: [this.alliedArmy.castle, this.enemyArmy.castle],
      towers: [...this.alliedArmy.towers, ...this.enemyArmy.towers],
      paths: [this.alliedArmy.path, this.enemyArmy.path],
      enemyEntities: [...this.physics.units],
    };
    return battleState;
  }
}
