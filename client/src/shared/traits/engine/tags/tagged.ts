import { ImplementsTrait, implementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
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
			this.tags = props.tagHolder.tags;
		}
	}
	return HTTagged;
});

// Recruits and battle entities copy their tags through HTTag, so they don't carry
// the tag traits themselves: check the tags array instead of implementsTrait(x, FoodTag).
export function hasTag(element: object, tag: Tag): boolean {
	return implementsTrait(element, Tagged) && element.tags.includes(tag);
}

export type Tag = BiomeTag | SpeciesTag | AlignmentType | BuildingTag;
