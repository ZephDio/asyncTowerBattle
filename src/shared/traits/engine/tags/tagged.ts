import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
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

export const HTTag = Subtrait([Tagged], (base, Props) => {
	abstract class HTTagged extends base {
		constructor(props: { tagHolder: ImplementsTrait<typeof Tagged> } & typeof Props) {
			super(props);
				this.tags = props.tagHolder.tags
		}
	}
	return HTTagged;
});

export type Tag = BiomeTag | SpeciesTag | AlignmentType | BuildingTag;
