import { BlueTowerBlueprint } from "./implementation/blue-tower";
import { FrostTowerBlueprint } from "./implementation/frost-tower";
import { GreenTowerBlueprint } from "./implementation/green-tower";
import { YellowTowerBlueprint } from "./implementation/yellow-tower";
import { ZappingTowerBlueprint } from "./implementation/zapping-tower";

export type AnyTowerBlueprint =
	| BlueTowerBlueprint
	| GreenTowerBlueprint
	| YellowTowerBlueprint
	| ZappingTowerBlueprint
	| FrostTowerBlueprint;
