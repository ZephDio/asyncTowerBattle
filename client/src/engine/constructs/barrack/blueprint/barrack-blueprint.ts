import { BasicBarrackBlueprint } from "./implementation/basic-barrack-blueprint";
import { VeterantBarrackBlueprint } from "./implementation/veteran-barrack-blueprint";
import { WaveBarrackBlueprint } from "./implementation/wave-barrack-blueprint";
import { RushBarrackBlueprint } from "./implementation/rush-barrack-blueprint";
import { HuntersAcademyBlueprint } from "./implementation/hunters-academy-blueprint";

export type AnyBarrackBlueprint =
	| BasicBarrackBlueprint
	| WaveBarrackBlueprint
	| VeterantBarrackBlueprint
	| RushBarrackBlueprint
	| HuntersAcademyBlueprint;
