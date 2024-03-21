import { BattleArmy } from "../army/battle/battle-army";

export class Physics {
  constructor(public alliedArmy: BattleArmy, public enemyArmy: BattleArmy) { }

  tick() {
    this.tickBarracks();
    this.tickUnits();
    this.setTowersTargets();
    this.tickTowers();
    this.tickProjectiles();
  }

  tickTowers() {
    this.setTowersTargets();
    for (const tower of this.alliedArmy.towers) {
      tower.tick();
    }
    for (const tower of this.enemyArmy.towers) {
      tower.tick();
    }
  }

  setTowersTargets() {
    for (const tower of this.alliedArmy.towers) {
      const target = tower.target;
      if (target && tower.entity.matchesRule(target)) {
        continue;
      }
      for (const enemyUnits of this.enemyArmy.units.keys()) {
        if (tower.entity.matchesRule(enemyUnits)) {
          tower.setTarget(enemyUnits);
        }
      }
    }
  }

  tickBarracks() {
    this.alliedArmy.barracks.map((b) => b.tick());
    this.enemyArmy.barracks.map((b) => b.tick());
  }

  tickUnits() {
    for (const [unit, barrack] of this.alliedArmy.units.entries()) {
      unit.tick();
    }
    for (const [unit, barrack] of this.enemyArmy.units.entries()) {
      unit.tick();
    }
  }

  tickProjectiles() {
    for (const [projectile, tower] of this.alliedArmy.projectiles.entries()) {
      projectile.tick();
    }
    for (const [projectile, tower] of this.enemyArmy.projectiles.entries()) {
      projectile.tick();
    }
  }

  get units() {
    return [...this.alliedArmy.units.keys(), ...this.enemyArmy.units.keys()];
  }

  get projectiles() {
    return [...this.alliedArmy.projectiles.keys(), ...this.enemyArmy.projectiles.keys()]
  }
}
