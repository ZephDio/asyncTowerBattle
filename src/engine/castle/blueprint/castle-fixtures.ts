import { ElfCastleBlueprint } from "./elf-castle-blueprint";

export class CastleBlueprintFixtures {
	static get allied() {
		return new ElfCastleBlueprint({});
	}

	static get enemy() {
		return new ElfCastleBlueprint({});
	}
}
