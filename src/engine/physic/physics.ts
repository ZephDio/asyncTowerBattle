import { BattleArmy } from "../army/battle-army";

export class Physics {
  constructor(public alliedArmy: BattleArmy, public enemyArmy: BattleArmy) {
  }

  tick() {
    this.tickBarracks()
    this.tickUnits()
  }

  tickBarracks() {
    this.alliedArmy.barracks.map(b => b.tick())
    this.enemyArmy.barracks.map(b => b.tick())
  }

  tickUnits() {
    for (const [unit, barrack] of this.alliedArmy.units.entries()) {
      unit.tick();
    }
    for (const [unit, barrack] of this.enemyArmy.units.entries()) {
      unit.tick();
    }
  }

  get units() {
    return [...this.alliedArmy.units.keys(), ...this.enemyArmy.units.keys()]
  }
}
