import { Subtrait } from "@ddd-ts/traits";
import { Tagged } from "../tagged";

export const SPECIES_TAGS = ["Kinfolk", "Animal", "Monster"] as const;
export type SpeciesTag = (typeof SPECIES_TAGS)[number];

export const KinfolkTag = Subtrait([Tagged], (base, Props) => {
	abstract class TKinfolkTag extends base {
		kinfolkTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Kinfolk");
		}
	}
	return TKinfolkTag;
});

export const AnimalTag = Subtrait([Tagged], (base, Props) => {
	abstract class TAnimalTag extends base {
		animalTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Animal");
		}
	}
	return TAnimalTag;
});

export const MonsterTag = Subtrait([Tagged], (base, Props) => {
	abstract class TMonsterTag extends base {
		monsterTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Monster");
		}
	}
	return TMonsterTag;
});
