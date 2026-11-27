import { Subtrait, Trait } from "@ddd-ts/traits";

// A science is a token an army holds because it owns pieces that grant it. A blueprint can require one: the shop
// does not offer it until the army holds that science.
export enum Science {
	Elf = "elf",
	Dwarf = "dwarf",
	Witchcraft = "witchcraft",
	Trap = "trap",
}

// The sciences a piece grants to the army that owns it.
export const TGrantsScience = (...sciences: Science[]) =>
	Trait((base) => {
		abstract class IGrantsScience extends base {
			grantedSciences: readonly Science[] = sciences;
		}
		return IGrantsScience;
	});

// The science an army must hold before the shop offers this blueprint.
export const TRequiresScience = (science: Science) =>
	Trait((base) => {
		abstract class IRequiresScience extends base {
			requiredScience: Science = science;
		}
		return IRequiresScience;
	});

// Both traits are factories, so implementsTrait can't detect them: read the field instead.
export function requiredScienceOf(element: object): Science | undefined {
	return "requiredScience" in element ? (element.requiredScience as Science) : undefined;
}

// An element that has no sciences of its own but is described as another one (a battle tower as its recruit) grants
// that one's.
export function grantedSciencesOf(element: object): readonly Science[] {
	if ("grantedSciences" in element) return element.grantedSciences as readonly Science[];
	if ("describedBy" in element && element.describedBy && element.describedBy !== element) {
		return grantedSciencesOf(element.describedBy);
	}
	return [];
}

// Recruits copy the sciences of the blueprint they are built from.
export const HTGrantsScience = Subtrait([TGrantsScience()], (base, Props) => {
	abstract class IGrantsScienceHolder extends base {
		constructor(props: { scienceHolder: object } & typeof Props) {
			super(props);
			this.grantedSciences = grantedSciencesOf(props.scienceHolder);
		}
	}
	return IGrantsScienceHolder;
});

export const sciencesGrantedBy = (elements: Iterable<object>): Set<Science> => {
	const sciences = new Set<Science>();
	for (const element of elements) grantedSciencesOf(element).forEach((science) => sciences.add(science));
	return sciences;
};
