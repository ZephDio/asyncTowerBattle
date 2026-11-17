import { BlueTowerBlueprint } from "./implementation/blue-tower-blueprint";
import { DrillTowerBlueprint } from "./implementation/drill-tower-blueprint";
import { FrostTowerBlueprint } from "./implementation/frost-tower-blueprint";
import { GreenTowerBlueprint } from "./implementation/green-tower-blueprint";
import { WitchHouseBlueprint } from "./implementation/witch-house-blueprint";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower-blueprint";

export type AnyTowerBlueprint =
	| BlueTowerBlueprint
	| GreenTowerBlueprint
	| WitchHouseBlueprint
	| ZappingTowerBlueprint
	| FrostTowerBlueprint
	| DrillTowerBlueprint;
