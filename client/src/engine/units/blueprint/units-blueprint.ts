import { BrewmasterBlueprint } from "./implementation/brewmaster-blueprint";
import { ChoupissonBlueprint } from "./implementation/choupisson-blueprint";
import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { EntBlueprint } from "./implementation/ent-blueprint";
import { FoxBlueprint } from "./implementation/fox-blueprint";
import { ParadiseBirdBlueprint } from "./implementation/paradise-bird-blueprint";
import { GoGoatBlueprint } from "./implementation/go-goat-blueprint";
import { FrogBlueprint } from "./implementation/frog-blueprint";
import { WhiteStagBlueprint } from "./implementation/white-stag-blueprint";

export type AnyUnitBlueprint =
	| DragonBlueprint
	| WhiteStagBlueprint
	| FoxBlueprint
	| ChoupissonBlueprint
	| EntBlueprint
	| BrewmasterBlueprint
	| GoGoatBlueprint
	| ParadiseBirdBlueprint
	| FrogBlueprint;
