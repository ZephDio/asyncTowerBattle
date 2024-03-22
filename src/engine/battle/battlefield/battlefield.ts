import { getDistance, Position } from "../../../shared/position";
import { Army } from "../../army/entity/army";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { UnitRecruitPhysic } from "../../units/battle/entity-units-physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { PhysicEntity } from "../../../shared/physic";
import { BattleArmy } from "../../army/battle/battle-army";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Path } from "../../path/entity/path";
import { SoldierBarrack } from "../../barrack/entity/implementation/solider-barrack";

export class Battlefield {
  public alliedArmy: BattleArmy;
  public enemyArmy: BattleArmy;
  constructor(alliedArmy: Army, enemyArmy: Army) {
    const enemyCastle = new BattleCastle(enemyArmy.castle);
    const alliedCastle = new BattleCastle(alliedArmy.castle);
    this.alliedArmy = this.buildBattleArmy(alliedArmy, enemyCastle, alliedCastle, enemyArmy.path);
    this.enemyArmy = this.buildBattleArmy(enemyArmy, alliedCastle, enemyCastle, alliedArmy.path);
  }

  buildBattleArmy(army: Army, enemyCastle: BattleCastle, alliedCastle: BattleCastle, enemyPath: Path) {
    return new BattleArmy(army, enemyCastle, alliedCastle, enemyPath, army.barracks as SoldierBarrack[], this.setArmyTowerTarget);
  }

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
    this.setArmyTowerTarget(this.alliedArmy.towers, [...this.enemyArmy.units.keys()]);
    this.setArmyTowerTarget(this.enemyArmy.towers, [...this.alliedArmy.units.keys()]);
  }

  setArmyTowerTarget(towers: BattleTower<TowerRecruit<Tower>>[], units: UnitRecruitPhysic<UnitRecruit<Unit>>[]) {
    for (const tower of towers) {
      if (tower.target && tower.entity.doesTargetMatchesRule(tower.target)) {
        continue;
      }
      let bestTarget: [UnitRecruitPhysic<UnitRecruit<Unit>> | null, number] = [null, 10000];
      for (const enemyUnit of units) {
        if (tower.entity.doesTargetMatchesRule(enemyUnit)) {
          const distance = getDistance(tower.position, enemyUnit.position);
          if (distance < bestTarget[1]) {
            bestTarget = [enemyUnit, distance];
          }
        }
      }
      tower.setTarget(bestTarget[0]);
    }
  }

  searchAlliedTowerTarget(tower: BattleTower<TowerRecruit<Tower>>) {
    let bestTarget: [UnitRecruitPhysic<UnitRecruit<Unit>> | null, number] = [null, Infinity];
    for (const enemyUnit of [...this.enemyArmy.units.keys()]) {
      if (tower.entity.doesTargetMatchesRule(enemyUnit)) {
        const distance = getDistance(tower.position, enemyUnit.position);
        if (distance < bestTarget[1]) {
          bestTarget = [enemyUnit, distance];
        }
      }
    }
    return bestTarget[0];
  }

  searchEnemyTowerTarget(tower: BattleTower<TowerRecruit<Tower>>) {
    let bestTarget: [UnitRecruitPhysic<UnitRecruit<Unit>> | null, number] = [null, Infinity];
    for (const enemyUnit of [...this.alliedArmy.units.keys()]) {
      if (tower.entity.doesTargetMatchesRule(enemyUnit)) {
        const distance = getDistance(tower.position, enemyUnit.position);
        if (distance < bestTarget[1]) {
          bestTarget = [enemyUnit, distance];
        }
      }
    }
    return bestTarget[0];
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
    return [...this.alliedArmy.projectiles.keys(), ...this.enemyArmy.projectiles.keys()];
  }
}
