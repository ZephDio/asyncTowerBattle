import { BakeryBlueprint } from "./implementation/bakery";
import { CropsFieldBlueprint } from "./implementation/crops-field";
import { GobelinPortalBlueprint } from "./implementation/gobelin-portal";
import { OrangeTotemBlueprint } from "./implementation/orange-totem";
import { WindmillBlueprint } from "./implementation/windmill";

export type AnyTotemBlueprint =
	| OrangeTotemBlueprint
	| GobelinPortalBlueprint
	| WindmillBlueprint
	| CropsFieldBlueprint
	| BakeryBlueprint;
