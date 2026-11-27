// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { Science } from "../../../../../shared/traits/engine/science";
import { UnitRecruitFixture } from "../../../../units/recruit/unit-fixtures";
import { Forest } from "../../../../environment/forest";
import { Rock } from "../../../../environment/rock";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { HuntersAcademy } from "../../recruit/implementation/hunters-academy";
import { HuntersAcademyBlueprint } from "../../blueprint/implementation/hunters-academy-blueprint";
import { ForestCabin } from "../../../tower/recruit/implementation/forest-cabin";
import { Bosquet } from "../../../totem/recruit/implementation/bosquet";
import { SURROUNDING_CELLS_1X2 } from "../../barrack-name-synergy";

const at = (x: number, y: number) => new Cell({ x, y });
const key = (cells: Cell[]) => cells.map((cell) => `${cell.x},${cell.y}`).sort();

type Placed = { cell: Cell; footprint: Cell[]; element: object };
const placed = (element: { gridShape: { getOccupiedCellsFrom: (cell: Cell) => Cell[] } }, cell: Cell): Placed => ({
	cell,
	footprint: element.gridShape.getOccupiedCellsFrom(cell),
	element,
});

// The academy's anchor is (5, 5): it covers (5, 5) and (5, 6).
const academyCell = at(5, 5);

const castSpeedPercent = (neighbors: Placed[]) => {
	const hooks = {
		getDefaultUnit: () => UnitRecruitFixture.dragon,
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map(
					(relative) =>
						neighbors.find(({ footprint }) =>
							footprint.some((c) => c.x === cell.x + relative.x && c.y === cell.y + relative.y),
						)?.element,
				),
		},
	} as unknown as BattleArmyHooks;
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const battle = new HuntersAcademy(academyCell).toAllied(grid as never, hooks);
	battle.onBattleStart();
	return battle.stats.basePercentStat.castSpeed - 100;
};

const forestAt = (x: number, y: number): Placed => ({
	cell: at(x, y),
	footprint: [at(x, y)],
	element: new Forest(at(x, y)),
});

describe("Hunter's Academy", () => {
	const blueprint = new HuntersAcademyBlueprint({});

	it("is an Uncommon barrack at 15 gold, with a 0.8 cast speed", () => {
		expect(blueprint.rarity).toBe(Rarity.Uncommon);
		expect(blueprint.price).toBe(15);
		expect(blueprint.stats.castSpeed).toBe(0.8);
		expect(blueprint.tags).toContain("Barrack");
		expect(new HuntersAcademy(academyCell).stats.castSpeed).toBe(0.8);
	});

	it("has two cells and six stars around them, corners left out", () => {
		const academy = new HuntersAcademy(academyCell);
		expect(key(academy.gridShape.getOccupiedCellsFrom(academyCell))).toEqual(["5,5", "5,6"]);
		expect(key(SURROUNDING_CELLS_1X2())).toEqual(["-1,0", "-1,1", "0,-1", "0,2", "1,0", "1,1"]);
		expect(key(academy.patternEffect.getRelativeCells(BoardOrientation.Normal))).toEqual(key(SURROUNDING_CELLS_1X2()));
	});

	it("gains nothing with nothing on its stars", () => {
		expect(castSpeedPercent([])).toBe(0);
	});

	it("gains 5% per barrack of another name, 0 for its own name", () => {
		const basic = placed(new BasicBarrack(at(4, 5)), at(4, 5));
		const wave = placed(new WaveBarrack(at(6, 5)), at(6, 5));
		const other = placed(new HuntersAcademy(at(5, 8)), at(5, 8));
		expect(castSpeedPercent([basic])).toBe(5);
		expect(castSpeedPercent([basic, wave])).toBe(10);
		expect(castSpeedPercent([other])).toBe(0);
	});

	it("gains 10% per Forest, once for a piece covering several stars", () => {
		expect(castSpeedPercent([forestAt(4, 5)])).toBe(10);
		expect(castSpeedPercent([forestAt(4, 5), forestAt(6, 6)])).toBe(20);
		expect(
			castSpeedPercent([{ cell: at(4, 5), footprint: [at(4, 5), at(4, 6)], element: new Bosquet(at(4, 5)) }]),
		).toBe(10);
		expect(castSpeedPercent([placed(new ForestCabin(at(5, 4)), at(5, 4))])).toBe(10);
		expect(castSpeedPercent([{ cell: at(4, 5), footprint: [at(4, 5)], element: new Rock(at(4, 5)) }])).toBe(0);
	});

	it("adds barracks and Forests together", () => {
		const basic = placed(new BasicBarrack(at(4, 5)), at(4, 5));
		expect(castSpeedPercent([basic, forestAt(6, 5), forestAt(6, 6)])).toBe(25);
	});

	it("grants the Trap science", () => {
		expect([...new HuntersAcademy(academyCell).grantedSciences]).toEqual([Science.Trap]);
	});
});
