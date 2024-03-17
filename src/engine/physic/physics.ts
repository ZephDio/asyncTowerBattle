import { Path } from "../path/domain/path";
import { SoldierEntityUnit, Unit, UnitEntity } from "../units/domain/units";
import { Physic } from "./physic";
import { SoldierEntityUnitPhysic } from "./units/entity-units-physic";

export class Physics {
  units: Physic<UnitEntity<Unit>>[] = [];
  constructor(units: UnitEntity<Unit>[], path: Path) {
    this.units = units.map(
      (unit) => new SoldierEntityUnitPhysic(unit as SoldierEntityUnit, path)
    );
  }

  tick() {
    for (const unit of this.units) {
      unit.tick();
    }
  }
}
