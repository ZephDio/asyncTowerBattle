import { BasicBarrackBlueprint } from "./implementation/basic-barrack-blueprint";
import { RushBarrackBlueprint } from "./implementation/rush-barrack-blueprint";

export class BarrackFixtures {
	static basic() {
		return new BasicBarrackBlueprint({});
	}

	static rush() {
		return new RushBarrackBlueprint({});
	}
}
