import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { TargetZone } from "../../../engine/target-zone/target-zone";

// A tower finds its targets in the cells of its target zone instead of within a distance.
export const TTargeting = Trait((base) => {
	abstract class ITargeting extends base {
		targetZone: TargetZone = TargetZone.around();
	}
	return ITargeting;
});

export const HTTargeting = Subtrait([TTargeting], (base, Param) => {
	class IHTargeting extends base {
		constructor(props: { targeting: ImplementsTrait<typeof TTargeting> } & typeof Param) {
			super(props);
			this.targetZone = props.targeting.targetZone;
		}
	}
	return IHTargeting;
});
