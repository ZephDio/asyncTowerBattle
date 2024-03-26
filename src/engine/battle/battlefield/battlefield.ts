import { Army } from "../../army/entity/army";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { BattleUnit } from "../../units/battle/entity-units-physic";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { BattleArmy } from "../../army/battle/battle-army";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { ArmyPath, BattlePath } from "../../path/entity/path";
import { SoldierBarrack } from "../../barrack/entity/implementation/solider-barrack";
import { Battle } from "../battle";
import { Physic } from "../../../shared/physic";
import { HitBox } from "../../../shared/hitboxes";
import { Position } from "../../../shared/position";
import { BattleGrid } from "../../grid/battle-grid";

export type SearchTarget = Battlefield["searchAlliedTowerTarget"] | Battlefield["searchEnemyTowerTarget"];
export type SearchAreaForUnit = Battlefield["searchAlliesInArea"] | Battlefield["searchEnemiesInArea"];
export class Battlefield {
  public alliedArmy: BattleArmy;
  public enemyArmy: BattleArmy;
  public grid: BattleGrid;
  constructor(alliedArmy: Army, enemyArmy: Army, public onBattleOver: Battle["handleBattleOver"]) {
    const { alliedBattleArmy, enemyBattleArmy, battleGrid } = this.init(alliedArmy, enemyArmy);
    this.alliedArmy = alliedBattleArmy;
    this.enemyArmy = enemyBattleArmy;
    this.grid = battleGrid;
  }

  init(alliedArmy: Army, enemyArmy: Army): { alliedBattleArmy: BattleArmy; enemyBattleArmy: BattleArmy; battleGrid: BattleGrid } {
    const grid = BattleGrid.fuse(alliedArmy.grid, enemyArmy.grid);
    const enemyCastle = new BattleCastle(
      enemyArmy.castle,
      () => this.onBattleOver("victory"),
      enemyArmy.grid.gridPositionToReal(enemyArmy.castle.gridPosition)
    );
    const alliedCastle = new BattleCastle(
      alliedArmy.castle,
      () => this.onBattleOver("defeat"),
      alliedArmy.grid.gridPositionToReal(alliedArmy.castle.gridPosition)
    );
    const alliedBattlePath = alliedArmy.path.toBattlePath(alliedArmy.grid, alliedCastle, enemyCastle);
    const enemyBattlePath = enemyArmy.path.toBattlePath(alliedArmy.grid, enemyCastle, alliedCastle);
    const alliedBattleArmy = this.buildBattleArmy(
      alliedArmy,
      enemyCastle,
      alliedCastle,
      enemyBattlePath,
      this.searchAlliedTowerTarget.bind(this),
      this.searchEnemiesInArea.bind(this)
    );
    const enemyBattleArmy = this.buildBattleArmy(
      enemyArmy,
      alliedCastle,
      enemyCastle,
      alliedBattlePath,
      this.searchEnemyTowerTarget.bind(this),
      this.searchAlliesInArea.bind(this)
    );

    enemyBattleArmy.flip();

    return {
      alliedBattleArmy: alliedBattleArmy,
      enemyBattleArmy: enemyBattleArmy,
      battleGrid: grid,
    };
  }

  buildBattleArmy(
    army: Army,
    enemyCastle: BattleCastle,
    alliedCastle: BattleCastle,
    enemyPath: BattlePath,
    grid: BattleGrid,
    setTarget: SearchTarget,
    searchEnemiesInArea: SearchAreaForUnit
  ) {
    return new BattleArmy(
      army,
      enemyCastle,
      alliedCastle,
      enemyPath,
      army.barracks as SoldierBarrack[],
      grid,
      setTarget,
      searchEnemiesInArea
    );
  }

  tick() {
    this.tickBarracks();
    this.tickProjectiles();
    this.tickUnits();
    this.tickTowers();
    this.tickAreaEffects();
  }

  tickTowers() {
    for (const tower of this.alliedArmy.towers) {
      tower.tick();
    }
    for (const tower of this.enemyArmy.towers) {
      tower.tick();
    }
  }

  searchEnemiesInArea(areaPosition: Position, hitbox: HitBox): BattleUnit<UnitRecruit<Unit>>[] {
    const found: BattleUnit<UnitRecruit<Unit>>[] = [];
    for (const enemyUnit of this.enemyArmy.units.keys()) {
      if (Physic.doCollide(areaPosition, hitbox, enemyUnit.position)) {
        found.push(enemyUnit);
      }
    }
    return found;
  }

  searchAlliesInArea(areaPosition: Position, hitbox: HitBox): BattleUnit<UnitRecruit<Unit>>[] {
    const found: BattleUnit<UnitRecruit<Unit>>[] = [];
    for (const enemyUnit of this.alliedArmy.units.keys()) {
      if (Physic.doCollide(areaPosition, hitbox, enemyUnit.position)) {
        found.push(enemyUnit);
      }
    }
    return found;
  }

  searchAlliedTowerTarget(tower: BattleTower<TowerRecruit<Tower>>) {
    let bestTarget: [BattleUnit<UnitRecruit<Unit>> | null, number] = [null, Infinity];
    for (const enemyUnit of [...this.enemyArmy.units.keys()]) {
      const distanceSqrd = Physic.getDistanceSqrd(tower.position, enemyUnit.position);
      if (tower.entity.doesTargetMatchesRule(enemyUnit, distanceSqrd)) {
        if (distanceSqrd < bestTarget[1]) {
          bestTarget = [enemyUnit, distanceSqrd];
        }
      }
    }
    return bestTarget[0];
  }

  searchEnemyTowerTarget(tower: BattleTower<TowerRecruit<Tower>>) {
    let bestTarget: [BattleUnit<UnitRecruit<Unit>> | null, number] = [null, Infinity];
    for (const enemyUnit of [...this.alliedArmy.units.keys()]) {
      const distanceSqrd = Physic.getDistanceSqrd(tower.position, enemyUnit.position);
      if (tower.entity.doesTargetMatchesRule(enemyUnit, distanceSqrd)) {
        if (distanceSqrd < bestTarget[1]) {
          bestTarget = [enemyUnit, distanceSqrd];
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

  tickAreaEffects() {
    for (const [areaEffect, source] of this.alliedArmy.areaEffects.entries()) {
      areaEffect.tick();
    }
    for (const [areaEffect, source] of this.enemyArmy.areaEffects.entries()) {
      areaEffect.tick();
    }
  }

  get units() {
    return [...this.alliedArmy.units.keys(), ...this.enemyArmy.units.keys()];
  }

  get projectiles() {
    return [...this.alliedArmy.projectiles.keys(), ...this.enemyArmy.projectiles.keys()];
  }

  get areaEffects() {
    return [...this.alliedArmy.areaEffects.keys(), ...this.enemyArmy.areaEffects.keys()];
  }
}
