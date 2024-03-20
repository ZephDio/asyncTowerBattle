import { SoldierRecruit } from "../recruit/implementation/soldier-recruit";
import { Soldier } from "./implementation/soldier";

export class UnitEntityFixture {
  static soldier = new SoldierRecruit(new Soldier());
}
