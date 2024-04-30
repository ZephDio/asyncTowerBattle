import { HumanCastleBlueprint } from "./human-castle-blueprint";


export class CastleBlueprintFixtures {
	static get allied() {
		return new HumanCastleBlueprint({});
	}

	static get enemy() {
		return new HumanCastleBlueprint({});
	}
}
