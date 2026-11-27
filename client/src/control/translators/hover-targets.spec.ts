import "../../engine/match-maker/board-serializer";
// After the serializer: loaded first, these run into the engine's grid <-> render traits import cycle.
import { Cell } from "../../shared/position";
import { ArmyGrid } from "../../engine/grid/grid";
import { BasicBarrack } from "../../engine/constructs/barrack/recruit/implementation/basic-barrack";
import { BasicPathTile } from "../../engine/tile/recruit/implementation/basic-tile";
import { SlowingTrap } from "../../engine/trap/recruit/implementation/slowing-trap";
import { Fox } from "../../engine/units/recruit/implementation/fox";
import { ShopInputToIntentTranslator } from "./shop-input-translator";

const origin = () => new Cell({ x: 0, y: 0 });
const translator = new ShopInputToIntentTranslator();

describe("hover targets", () => {
	it("lights the unit on a barrack alone in its grab zone, the barrack with its unit elsewhere", () => {
		const barrack = new BasicBarrack(origin());
		const unit = new Fox(origin());
		barrack.setUnit(unit);
		expect(translator.hoverTargets(barrack, unit)).toEqual([barrack.unitPreview]);
		expect(translator.hoverTargets(barrack, barrack)).toEqual([barrack, barrack.unitPreview]);
	});

	it("lights the trap on a path tile alone in its zone, the tile with its trap elsewhere", () => {
		const tile = new BasicPathTile(origin());
		const trap = new SlowingTrap(origin());
		tile.attachTrap(trap);
		expect(translator.hoverTargets(tile, trap)).toEqual([trap]);
		expect(translator.hoverTargets(tile, tile)).toEqual([tile, trap]);
	});

	it("replaces the yellow cells, and the yellow cells replace it", () => {
		const grid = new ArmyGrid();
		const tile = new BasicPathTile(origin());
		grid.setOveredTile([origin()]);
		grid.setHovered([tile]);
		expect(grid.hoverEffect).toEqual([]);
		expect(grid.isHovered(tile)).toBe(true);
		grid.setOveredTile([origin()]);
		expect(grid.isHovered(tile)).toBe(false);
		expect(grid.hoverEffect).toHaveLength(1);
	});
});
