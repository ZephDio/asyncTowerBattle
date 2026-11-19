import { BlacksmithTowerBlueprint } from "./implementation/blacksmith-tower-blueprint";
import { DrillTowerBlueprint } from "./implementation/drill-tower-blueprint";
import { FrostTowerBlueprint } from "./implementation/frost-tower-blueprint";
import { WindmillTurretBlueprint } from "./implementation/windmill-turret-blueprint";
import { WitchHouseBlueprint } from "./implementation/witch-house-blueprint";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower-blueprint";

export type AnyTowerBlueprint =
	| BlacksmithTowerBlueprint
	| WindmillTurretBlueprint
	| WitchHouseBlueprint
	| ZappingTowerBlueprint
	| FrostTowerBlueprint
	| DrillTowerBlueprint;
