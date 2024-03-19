import { UnitEntityStore } from "../applicative/store/unit-store";
import { UnitRecruit } from "../domain/units";

export class UnitEntityStoreInMemory implements UnitEntityStore {
  units: UnitRecruit<any>[];
  constructor(units: UnitRecruit<any>[] = []) {
    this.units = units;
  }
  async getAll() {
    return this.units;
  }
}
