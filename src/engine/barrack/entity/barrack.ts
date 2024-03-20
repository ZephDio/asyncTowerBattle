import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";

export abstract class Barrack<U extends Unit> {
  abstract type: U["type"];
  abstract productionSpeed: number;
  abstract unitRecruit: UnitRecruit<U>;
}
