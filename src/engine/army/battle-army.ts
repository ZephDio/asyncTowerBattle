import { BattleBarrack } from "../barrack/battle-barrack";
import { BattleCastle } from "../physic/castle/battle-castle";
import { PhysicEntity } from "../physic/physic";
import { Soldier, SoldierRecruit, Unit, UnitRecruit } from "../units/domain/units";
import { Barrack } from "../barrack/barrack";
import { Army } from "./army";
import { Path } from "../path/domain/path";
import { Tower, TowerRecruit } from "../tower/domain/tower";
import { BattleTower } from "../physic/tower/entity-tower-physic";
import { SoldierBattleBarrack } from "../barrack/soldier-barrack";
export class BattleArmy {
  units: Map<PhysicEntity<UnitRecruit<Unit>>, BattleBarrack<UnitRecruit<Unit>>> =
    new Map();
  path: Path;
  castle: BattleCastle;
  barracks: BattleBarrack<UnitRecruit<Soldier>>[];

  towers: BattleTower<TowerRecruit<Tower>>[];

  constructor(
    army: Army,
    enemyCastle: BattleCastle,
    alliedCastle: BattleCastle,
    enemyPath: Path,
    barracks: Barrack<SoldierRecruit>[]
  ) {
    this.castle = alliedCastle;
    this.path = army.path;
    this.barracks = barracks.map(
      (barrack) =>
        new SoldierBattleBarrack(
          barrack.productionSpeed,
          alliedCastle.position,
          enemyPath,
          enemyCastle,
          (entityRecruit: PhysicEntity<UnitRecruit<Unit>>,
            battleBarrack: BattleBarrack<UnitRecruit<Unit>>) => {
            this.addUnit(entityRecruit, battleBarrack)
          },
          (entityRecruit: PhysicEntity<UnitRecruit<Unit>>) => { this.removeUnit(entityRecruit) },
          barrack.unitRecruit
        )
    );
    this.towers = army.towers.map((tower) => tower.toPhysic());
  }

  addUnit(
    entityRecruit: PhysicEntity<UnitRecruit<Unit>>,
    battleBarrack: BattleBarrack<UnitRecruit<Unit>>
  ) {
    this.units.set(entityRecruit, battleBarrack);
  }

  removeUnit(entityRecruit: PhysicEntity<UnitRecruit<Unit>>) {
    console.log(entityRecruit)
    this.units.delete(entityRecruit)
  }
}
