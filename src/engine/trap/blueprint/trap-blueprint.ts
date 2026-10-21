import { SlowingTrapBlueprint } from "./implementation/slowing-trap-blueprint";
import { StunTrapBlueprint } from "./implementation/stun-trap-blueprint";

export type AnyTrapBlueprint = SlowingTrapBlueprint | StunTrapBlueprint;
