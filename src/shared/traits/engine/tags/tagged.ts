import { Trait } from "@ddd-ts/traits";
import { SpeciesTag } from "./species/species-tag";
import { BiomeTag } from "./biome/biome-tags";
import { BuildingTag } from "./building/building-tags";
import { AlignmentType } from "./alignment/alignment-tags";

export const Tagged = Trait((base) => {
	abstract class Tagged extends base {
		tags: Tag[] = [];
	}
	return Tagged;
});
export type Tag = BiomeTag | SpeciesTag | AlignmentType | BuildingTag;
