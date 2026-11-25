import { ArmyGrid } from "./grid";

// The grid of a science's scroll (see SciencePanel): an army grid laid out flat on the parchment, so its pieces show
// their pattern and target cells when hovered, but drawn without cells or grass.
export class ScienceGrid extends ArmyGrid {
	override draw(): void {}
}
