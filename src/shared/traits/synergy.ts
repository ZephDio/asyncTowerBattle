import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";

import { Cell } from "../position";
import { GridElement } from "./grid-element";

export type Synergy = {
	patternEffect: Cell[];
	isPatternActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;
};

export const TSynergy = Trait((base) => {
	abstract class ISynergy extends base {
		abstract patternEffect: Cell[];
		abstract isPatternActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;

		getSynergies() {
			return {
				patternEffect: this.patternEffect,
				isPatternActivated: this.isPatternActivated,
			};
		}
	}
	return ISynergy;
});

export const HTSynergy = Subtrait([TSynergy], (base, Param) => {
	class THsynergy extends base {
		patternEffect: Cell[];
		isPatternActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;
		constructor(props: { synergy: ImplementsTrait<typeof TSynergy> } & typeof Param) {
			super(props);
			this.isPatternActivated = props.synergy.isPatternActivated;
			this.patternEffect = props.synergy.patternEffect;
			this.getSynergies = this.getSynergies.bind(this);
		}
	}
	return THsynergy;
});
