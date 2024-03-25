import { DragonRecruit } from "../recruit/implementation/dragon-recruit";
import { SoldierRecruit } from "../recruit/implementation/soldier-recruit";
import { Dragon } from "./implementation/dragon";
import { Soldier } from "./implementation/soldier";

export class UnitEntityFixture {
  static soldier = new SoldierRecruit(new Soldier());
  static dragon = new DragonRecruit(new Dragon())
}
