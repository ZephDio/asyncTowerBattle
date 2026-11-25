import { BoggedDown } from "./bogged-down";

// The slow of the Forest Cabin's bolts. Its own source, so it multiplies with the Mud Trap's slow instead of replacing it.
export class Hindered extends BoggedDown {
	override key: string = "hindered";
}
