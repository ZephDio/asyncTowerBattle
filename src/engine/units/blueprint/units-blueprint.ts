import { BersekerBlueprint } from "./implementation/berseker-blueprint";
import { BrewmasterBlueprint } from "./implementation/brewmaster-blueprint";
import { ChoupissonBlueprint } from "./implementation/choupisson-blueprint";
import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { EntBlueprint } from "./implementation/ent-blueprint";
import { FoxBlueprint } from "./implementation/fox-blueprint";
import { PriestBlueprint } from "./implementation/priest-blueprint";

export type AnyUnitBlueprint =
	| DragonBlueprint
	| PriestBlueprint
	| BersekerBlueprint
	| FoxBlueprint
	| ChoupissonBlueprint
	| EntBlueprint
	| BrewmasterBlueprint;
