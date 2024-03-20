import {
  Soldier,
  SoldierRecruit,
  Unit,
  UnitEntityFixture,
  UnitRecruit,
} from "../units/domain/units";
import { SoldierBarrack } from "./soldier-barrack";

export abstract class Barrack<U extends Unit> {
  abstract type: U["type"];
  abstract productionSpeed: number;
  abstract unitRecruit: UnitRecruit<U>;
}

// export const BarrackFixture = {
//   soldier: new SoldierBarrack(UnitEntityFixture.soldier),
// };
