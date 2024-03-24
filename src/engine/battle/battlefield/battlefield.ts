import { Army } from "../../army/entity/army";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { UnitRecruitPhysic } from "../../units/battle/entity-units-physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleArmy } from "../../army/battle/battle-army";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Path } from "../../path/entity/path";
import { SoldierBarrack } from "../../barrack/entity/implementation/solider-barrack";
import { Battle } from "../battle";
import { Physic } from "../../../shared/physic";

export type SearchTarget = Battlefield["searchAlliedTowerTarget"] | Battlefield["searchEnemyTowerTarget"];
export class Battlefield {
  public alliedArmy: BattleArmy;
  public enemyArmy: BattleArmy;
  constructor(alliedArmy: Army, enemyArmy: Army, public onBattleOver: Battle["handleBattleOver"]) {
    const enemyCastle = new BattleCastle(enemyArmy.castle, () => this.onBattleOver("victory"));
    const alliedCastle = new BattleCastle(alliedArmy.castle, () => this.onBattleOver("defeat"));
    this.alliedArmy = this.buildBattleArmy(alliedArmy, enemyCastle, alliedCastle, enemyArmy.path, this.searchAlliedTowerTarget.bind(this));
    this.enemyArmy = this.buildBattleArmy(enemyArmy, alliedCastle, enemyCastle, alliedArmy.path, this.searchEnemyTowerTarget.bind(this));
  }

  buildBattleArmy(army: Army, enemyCastle: BattleCastle, alliedCastle: BattleCastle, enemyPath: Path, setTarget: SearchTarget) {
    return new BattleArmy(army, enemyCastle, alliedCastle, enemyPath, army.barracks as SoldierBarrack[], setTarget);
  }

  tick() {
    this.tickBarracks();
    this.tickUnits();
    this.tickTowers();
    this.tickProjectiles();
  }

  tickTowers() {
    for (const tower of this.alliedArmy.towers) {
      tower.tick();
    }
    for (const tower of this.enemyArmy.towers) {
      tower.tick();
    }
  }

  searchAlliedTowerTarget(tower: BattleTower<TowerRecruit<Tower>>) {
    let bestTarget: [UnitRecruitPhysic<UnitRecruit<Unit>> | null, number] = [null, Infinity];
    for (const enemyUnit of [...this.enemyArmy.units.keys()]) {
      if (tower.entity.doesTargetMatchesRule(enemyUnit)) {
        const distance = Physic.getDistance(tower.position, enemyUnit.position);
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
        const distance = Physic.getDistance(tower.position, enemyUnit.position);
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
