import { BersekerBlueprint } from "./implementation/berseker-blueprint";
import { ChoupissonBlueprint } from "./implementation/choupisson-blueprint";
import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { FoxBlueprint } from "./implementation/fox-blueprint";
import { PriestBlueprint } from "./implementation/priest-blueprint";

export type AnyUnitBlueprint = DragonBlueprint | PriestBlueprint | BersekerBlueprint | FoxBlueprint | ChoupissonBlueprint;
