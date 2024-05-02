import { BasicBarrackBlueprint } from "./implementation/basic-barrack-blueprint";
import { VeterantBarrackBlueprint } from "./implementation/veteran-barrack-blueprint";
import { WaveBarrackBlueprint } from "./implementation/wave-barrack-blueprint";

export type AnyBarrackBlueprint = BasicBarrackBlueprint | WaveBarrackBlueprint | VeterantBarrackBlueprint;
