import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { GridElement } from "./core/grid-element";
import { PatternEffect } from "../../../engine/pattern-effect/pattern-effect";

export const TSynergy = Trait((base) => {
	abstract class ISynergy extends base {
		abstract patternEffect: PatternEffect;
		abstract patternCondition: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;

		getRelativeSynergyCell(orientation: number) {
			return this.patternEffect.getRelativeCells(orientation);
		}
	}
	return ISynergy;
});

export const HTSynergy = Subtrait([TSynergy], (base, Param) => {
	class THsynergy extends base {
		patternEffect: PatternEffect;
		patternCondition: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;
		constructor(props: { synergy: ImplementsTrait<typeof TSynergy> } & typeof Param) {
			super(props);
			this.patternCondition = props.synergy.patternCondition;
			this.patternEffect = props.synergy.patternEffect;
		}
	}
	return THsynergy;
});
