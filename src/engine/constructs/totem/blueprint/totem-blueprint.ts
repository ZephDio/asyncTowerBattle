import { BakeryBlueprint } from "./implementation/bakery-blueprint";
import { BreweryBlueprint } from "./implementation/brewery-blueprint";
import { CropsFieldBlueprint } from "./implementation/crops-field-blueprint";
import { MineBlueprint } from "./implementation/mine-blueprint";
import { AnvilTotemBlueprint } from "./implementation/anvil-blueprint";
import { WindmillBlueprint } from "./implementation/windmill-blueprint";
import { GobelinPortalBlueprint } from "./implementation/gobelin-portal-blueprint";
import { PowderMagazineBlueprint } from "./implementation/powder-magazine-blueprint";
import { RedObeliskBlueprint } from "./implementation/red-obelisk";

export type AnyTotemBlueprint =
	| AnvilTotemBlueprint
	| GobelinPortalBlueprint
	| WindmillBlueprint
	| CropsFieldBlueprint
	| BakeryBlueprint
	| MineBlueprint
	| BreweryBlueprint
	| PowderMagazineBlueprint
	| RedObeliskBlueprint;
