import { BattleState } from "../../shared/gamestate";
import { Army } from "../army/entity/army";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleVerdict } from "../battle-summary/battle-summary";
import { Game } from "../game";
import { Path } from "../path/entity/path";
import { BattleCastle } from "../castle/battle/battle-castle";
import { Physics } from "../physic/physics";
import { SoldierBarrack } from "../barrack/entity/implementation/solider-barrack";

export class Battle {
  alliedArmy: BattleArmy;
  enemyArmy: BattleArmy;
  physics: Physics;
  isOver = false;
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
        if (this.isOver) return;
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
    enemyPath: Path
  ) {
    return new BattleArmy(
      army,
      enemyCastle,
      alliedCastle,
      enemyPath,
      army.barracks as SoldierBarrack[]
    );
  }

  tick() {
    const isOver = this.checkVictoryCondition();
    if (isOver === "onGoing") {
      this.physics.tick();
    } else {
      this.onBattleOver(isOver);
      this.isOver = true;
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
