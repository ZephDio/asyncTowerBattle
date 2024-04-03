import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { GridElement } from "../../engine/grid/grid";
import { Cell } from "../position";

export const TSynergy = Trait((base) => {
  abstract class ISynergy extends base {
    abstract patternEffect: Cell[];
    abstract isPatternActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean;
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
    }
  }
  return THsynergy;
});
