import { BersekerBlueprint } from "./implementation/berseker";
import { DragonBlueprint } from "./implementation/dragon";
import { FoxBlueprint } from "./implementation/fox";
import { PriestBlueprint } from "./implementation/priest";
import { SoldierBlueprint } from "./implementation/soldier";

export type AnyUnitBlueprint = DragonBlueprint | SoldierBlueprint | PriestBlueprint | BersekerBlueprint | FoxBlueprint;
