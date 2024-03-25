import { Soldier } from "./implementation/soldier";

export class UnitBuilder {
  buildSoldier(){
    return new Soldier()
  }
}

export class UnitFixture {
  static soldier = new UnitBuilder().buildSoldier()
}
