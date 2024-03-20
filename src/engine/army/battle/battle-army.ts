import { BattleBarrack } from "../../barrack/battle/battle-barrack";
import { SoldierBattleBarrack } from "../../barrack/battle/implementation/soldier-barrack";
import { Barrack } from "../../barrack/entity/barrack";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Path } from "../../path/entity/path";
import { PhysicEntity } from "../../physic/physic";
import { BattleTower } from "../../tower/battle/battle-tower";
import { Tower } from "../../tower/entity/tower";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { Soldier } from "../../units/entity/implementation/soldier";
import { Unit } from "../../units/entity/units";
import { SoldierRecruit } from "../../units/recruit/implementation/soldier-recruit";
import { UnitRecruit } from "../../units/recruit/unit-recruit";
import { Army } from "../entity/army";

export class BattleArmy {
  units: Map<
    PhysicEntity<UnitRecruit<Unit>>,
    BattleBarrack<UnitRecruit<Unit>>
  > = new Map();
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
          (
            entityRecruit: PhysicEntity<UnitRecruit<Unit>>,
            battleBarrack: BattleBarrack<UnitRecruit<Unit>>
          ) => {
            this.addUnit(entityRecruit, battleBarrack);
          },
          (entityRecruit: PhysicEntity<UnitRecruit<Unit>>) => {
            this.removeUnit(entityRecruit);
          },
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
    console.log(entityRecruit);
    this.units.delete(entityRecruit);
  }
}
