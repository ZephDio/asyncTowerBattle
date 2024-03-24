import { BattleBarrack } from "../../barrack/battle/battle-barrack";
import { SoldierBattleBarrack } from "../../barrack/battle/implementation/soldier-barrack";
import { Barrack } from "../../barrack/entity/barrack";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Path } from "../../path/entity/path";
import { BattleProjectile } from "../../projectile/battle/battle-projectile";
import { Projectile } from "../../projectile/entity/projectile";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { UnitRecruitPhysic } from "../../units/battle/entity-units-physic";
import { Soldier } from "../../units/entity/implementation/soldier";
import { Unit } from "../../units/entity/units";
import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Army } from "../entity/army";
import { SearchTarget } from "../../battle/battlefield/battlefield";

export class BattleArmy {
  units: Map<UnitRecruitPhysic<UnitRecruit<Unit>>, BattleBarrack<UnitRecruit<Unit>>> = new Map(); //.set(BattleUnitFixture.soldier, {} as any);
  path: Path;
  castle: BattleCastle;
  barracks: BattleBarrack<UnitRecruit<Soldier>>[];
  projectiles: Map<BattleProjectile<Projectile>, BattleTower<TowerRecruit<Tower>>> = new Map();
  towers: BattleTower<TowerRecruit<Tower>>[];

  constructor(army: Army, enemyCastle: BattleCastle, alliedCastle: BattleCastle, enemyPath: Path, barracks: Barrack<SoldierRecruit>[], public searchTarget: SearchTarget) {
    this.castle = alliedCastle;
    this.path = army.path;
    this.barracks = barracks.map(
      (barrack) =>
        new SoldierBattleBarrack(
          barrack.productionSpeed,
          { x: alliedCastle.position.x, y: alliedCastle.position.y },
          enemyPath,
          enemyCastle,
          (entityRecruit: UnitRecruitPhysic<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<UnitRecruit<Unit>>) => {
            this.addUnit(entityRecruit, battleBarrack);
          },
          (entityRecruit: UnitRecruitPhysic<UnitRecruit<Unit>>) => {
            this.removeUnit(entityRecruit);
          },
          barrack.unitRecruit
        )
    );
    this.towers = army.towers.map((tower) => tower.toPhysic(this.addProjectile.bind(this), this.removeProjectile.bind(this), this.searchTarget.bind(this)));
  }

  addUnit(entityRecruit: UnitRecruitPhysic<UnitRecruit<Unit>>, battleBarrack: BattleBarrack<UnitRecruit<Unit>>) {
    this.units.set(entityRecruit, battleBarrack);
  }

  removeUnit(entityRecruit: UnitRecruitPhysic<UnitRecruit<Unit>>) {
    this.units.delete(entityRecruit);
  }

  addProjectile(projectile: BattleProjectile<Projectile>, source: BattleTower<TowerRecruit<Tower>>) {
    this.projectiles.set(projectile, source);
  }

  removeProjectile(projectile: BattleProjectile<Projectile>) {
    this.projectiles.delete(projectile);
  }
}
