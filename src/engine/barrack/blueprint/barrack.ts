import { BasicBarrackBlueprint } from "./implementation/basic-barrack";
import { VeterantBarrackBlueprint } from "./implementation/veteran-barrack";
import { WaveBarrackBlueprint } from "./implementation/wave-barrack";

export type AnyBarrackBlueprint = BasicBarrackBlueprint | WaveBarrackBlueprint | VeterantBarrackBlueprint;
