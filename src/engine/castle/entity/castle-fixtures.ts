import { Castle } from "./castle";

export class CastleFixtures {
	static get allied() {
		return new Castle("allied");
	}

	static get enemy() {
		return new Castle("enemy");
	}
}
