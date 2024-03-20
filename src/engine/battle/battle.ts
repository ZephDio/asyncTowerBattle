import { Army } from "../army/army";
import { BattleArmy } from "../army/battle-army";
import { SoldierBarrack } from "../barrack/soldier-barrack";
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

  checkVictoryCondition() {
    if (this.enemyArmy.castle.actualLife <= 0) {
      return "victory";
    }
    if (this.alliedArmy.castle.actualLife <= 0) {
      return "defeat";
    }
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
    console.log('battle tick')
    const isOver = this.checkVictoryCondition();
    if (isOver) {
      console.log('Battle over')
      this.onBattleOver(isOver);
    }
    this.physics.tick();
    this.alliedArmy.barracks.map((b) => b.tick())
    this.enemyArmy.barracks.map((b) => b.tick())
  }
}
