import {
  Unit,
  UnitRecruit,
} from "../units/domain/units";

export abstract class Barrack<U extends Unit> {
  abstract type: U["type"];
  abstract productionSpeed: number;
  abstract unitRecruit: UnitRecruit<U>;
}

