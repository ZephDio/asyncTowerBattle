import { BakeryBlueprint } from "./implementation/bakery-blueprint";
import { BreweryBlueprint } from "./implementation/brewery-blueprint";
import { CropsFieldBlueprint } from "./implementation/crops-field-blueprint";
import { GobelinPortalBlueprint } from "./implementation/gobelin-portal";
import { MineBlueprint } from "./implementation/mine-blueprint";
import { AnvilTotemBlueprint } from "./implementation/anvil-blueprint";
import { WindmillBlueprint } from "./implementation/windmill-blueprint";

export type AnyTotemBlueprint =
	| AnvilTotemBlueprint
	| GobelinPortalBlueprint
	| WindmillBlueprint
	| CropsFieldBlueprint
	| BakeryBlueprint
	| MineBlueprint
	| BreweryBlueprint;
