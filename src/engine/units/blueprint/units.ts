import { BersekerBlueprint } from "./implementation/berseker";
import { DragonBlueprint } from "./implementation/dragon";
import { PriestBlueprint } from "./implementation/priest";
import { SoldierBlueprint } from "./implementation/soldier";

export type AnyUnitBlueprint = DragonBlueprint | SoldierBlueprint | PriestBlueprint | BersekerBlueprint;
