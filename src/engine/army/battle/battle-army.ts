import { BattleBarrack } from "../../barrack/battle/battle-barrack";
import { SoldierBattleBarrack } from "../../barrack/battle/implementation/soldier-barrack";
import { Barrack } from "../../barrack/entity/barrack";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { ArmyPath, BattlePath } from "../../path/entity/path";
import { BattleProjectile } from "../../projectile/battle/battle-projectile";
import { Projectile } from "../../projectile/entity/projectile";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { BattleUnit } from "../../units/battle/entity-units-physic";
import { Soldier } from "../../units/entity/implementation/soldier";
import { Unit } from "../../units/entity/units";
import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Army } from "../entity/army";
import { SearchAreaForUnit, SearchTarget } from "../../battle/battlefield/battlefield";
import { AreaEffect } from "../../area-effect/area-effect";
import { Grid } from "../../grid/grid";
import { BattleGrid } from "../../grid/battle-grid";

export type BattleArmyHooks = {
  addUnits: BattleArmy["addUnit"];
  removeUnit: BattleArmy["removeUnit"];
  addProjectile: BattleArmy["addProjectile"];
  removeProjectile: BattleArmy["removeProjectile"];
  addAreaEffect: BattleArmy["addAreaEffect"];
  removeAreaEffect: BattleArmy["removeAreaEffect"];
  searchTarget: BattleArmy["searchTarget"];
  searchEnemyInArea: BattleArmy["searchEnemyInArea"];
};

export class BattleArmy {
  units: Map<BattleUnit<UnitRecruit<Unit>>, BattleBarrack<UnitRecruit<Unit>>> = new Map(); //.set(BattleUnitFixture.soldier, {} as any);
  areaEffects: Map<AreaEffect, any> = new Map();
  path: ArmyPath;
  castle: BattleCastle;
  barracks: BattleBarrack<UnitRecruit<Soldier>>[];
  projectiles: Map<BattleProjectile<Projectile>, BattleTower<TowerRecruit<Tower>>> = new Map();
  towers: BattleTower<TowerRecruit<Tower>>[];

  constructor(
    army: Army,
    enemyCastle: BattleCastle,
    alliedCastle: BattleCastle,
    enemyPath: BattlePath,
    barracks: Barrack<SoldierRecruit>[],
    public grid: BattleGrid,
    public searchTarget: SearchTarget,
    public searchEnemyInArea: SearchAreaForUnit
  ) {
    this.castle = alliedCastle;
    this.path = army.path;
    this.barracks = barracks.map(
      (barrack) =>
        new SoldierBattleBarrack(
          barrack.productionSpeed,
          { x: alliedCastle.position.x, y: alliedCastle.position.y },
          enemyPath,
          enemyCastle,
          (entityRecruit: BattleUnit<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<UnitRecruit<Unit>>) => {
            this.addUnit(entityRecruit, battleBarrack);
          },
          (entityRecruit: BattleUnit<UnitRecruit<Unit>>) => {
            this.removeUnit(entityRecruit);
          },
          barrack.unitRecruit
        )
    );
    this.towers = army.towers.map((tower) => tower.toPhysic(this.grid.gridPositionToReal(tower.gridPosition), this.getHooks()));
  }

  flip() {}
  addUnit(entityRecruit: BattleUnit<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<UnitRecruit<Unit>>) {
    this.units.set(entityRecruit, battleBarrack);
  }

  removeUnit(entityRecruit: BattleUnit<UnitRecruit<Unit>>) {
    this.units.delete(entityRecruit);
  }

  addProjectile(projectile: BattleProjectile<Projectile>, source: BattleTower<TowerRecruit<Tower>>) {
    this.projectiles.set(projectile, source);
  }

  removeProjectile(projectile: BattleProjectile<Projectile>) {
    this.projectiles.delete(projectile);
  }

  addAreaEffect(areaEffect: AreaEffect, source: any) {
    this.areaEffects.set(areaEffect, source);
  }

  removeAreaEffect(areaEffect: AreaEffect) {
    this.areaEffects.delete(areaEffect);
  }

  getHooks(): BattleArmyHooks {
    return {
      addUnits: this.addUnit.bind(this),
      removeUnit: this.removeUnit.bind(this),
      addProjectile: this.addProjectile.bind(this),
      removeProjectile: this.removeProjectile.bind(this),
      addAreaEffect: this.addAreaEffect.bind(this),
      removeAreaEffect: this.removeAreaEffect.bind(this),
      searchTarget: this.searchTarget.bind(this),
      searchEnemyInArea: this.searchEnemyInArea.bind(this),
    };
  }
}
