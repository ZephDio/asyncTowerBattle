// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { UnitRecruitFixture } from "../../../../units/recruit/unit-fixtures";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack";
import { RushBarrack } from "../../recruit/implementation/rush-barrack";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack";
import { SURROUNDING_CELLS_1X1, SURROUNDING_CELLS_2X1 } from "../../barrack-name-synergy";
import type { AnyBarrack } from "../../recruit/barrack";

const key = (cells: Cell[]) => cells.map((cell) => `${cell.x},${cell.y}`).sort();

// The neighbors are what sits on the asked cells: barracks by their anchor cell.
const baseCastSpeedPercent = 100;

const castSpeedGain = (barrack: AnyBarrack, around: AnyBarrack[]) => {
	const hooks = {
		getDefaultUnit: () => UnitRecruitFixture.dragon,
		onUnitAdded: () => {},
		getAlliedUnits: () => [],
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map((relative) =>
					around.find((other) =>
						other.gridShape
							.getOccupiedCellsFrom(other.cell)
							.some((c) => c.x === cell.x + relative.x && c.y === cell.y + relative.y),
					),
				),
		},
	} as unknown as BattleArmyHooks;
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const battle = barrack.toAllied(grid as never, hooks);
	battle.onBattleStart();
	return battle.stats.basePercentStat.castSpeed - baseCastSpeedPercent;
};

describe("barrack name synergy", () => {
	it("looks at the cells touching the sides, not the corners", () => {
		expect(key(SURROUNDING_CELLS_1X1())).toEqual(["-1,0", "0,-1", "0,1", "1,0"]);
		expect(key(SURROUNDING_CELLS_2X1())).toEqual(["-1,0", "0,-1", "0,1", "1,-1", "1,1", "2,0"]);
	});

	it("is on every barrack, around its whole footprint", () => {
		const origin = new Cell({ x: 5, y: 5 });
		const around = (barrack: BasicBarrack | WaveBarrack | VeterantBarrack | RushBarrack) =>
			key(barrack.patternEffect.getRelativeCells(BoardOrientation.Normal)).length;
		expect(around(new BasicBarrack(origin))).toBe(4);
		expect(around(new WaveBarrack(origin))).toBe(4);
		expect(around(new VeterantBarrack(origin))).toBe(4);
		expect(around(new RushBarrack(origin))).toBe(6);
	});

	it("surrounds the footprint on both orientations, corners left out", () => {
		const origin = new Cell({ x: 0, y: 0 });
		for (const orientation of [BoardOrientation.Normal, BoardOrientation.Mirrored]) {
			for (const barrack of [new BasicBarrack(origin), new RushBarrack(origin)]) {
				const footprint = key(barrack.gridShape.getOccupiedCellsFrom(origin, orientation));
				const around = barrack.patternEffect.getRelativeCells(orientation);
				const sides = footprint.flatMap((cell) => {
					const [x, y] = cell.split(",").map(Number) as [number, number];
					return [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`];
				});
				const expected = [...new Set(sides)].filter((cell) => !footprint.includes(cell)).sort();
				expect(key(around)).toEqual(expected);
			}
		}
	});

	it("gives 5% cast speed per barrack with a different name", () => {
		const basic = new BasicBarrack(new Cell({ x: 5, y: 5 }));
		const wave = new WaveBarrack(new Cell({ x: 6, y: 5 }));
		const veterant = new VeterantBarrack(new Cell({ x: 5, y: 6 }));
		expect(castSpeedGain(basic, [basic])).toBe(0);
		expect(castSpeedGain(basic, [basic, wave])).toBe(5);
		expect(castSpeedGain(basic, [basic, wave, veterant])).toBe(10);
	});

	it("ignores barracks with the same name, corners, and counts a name once", () => {
		const basic = new BasicBarrack(new Cell({ x: 5, y: 5 }));
		expect(castSpeedGain(basic, [basic, new BasicBarrack(new Cell({ x: 6, y: 5 }))])).toBe(0);
		expect(castSpeedGain(basic, [basic, new WaveBarrack(new Cell({ x: 6, y: 6 }))])).toBe(0);
		const waves = [new WaveBarrack(new Cell({ x: 6, y: 5 })), new WaveBarrack(new Cell({ x: 4, y: 5 }))];
		expect(castSpeedGain(basic, [basic, ...waves])).toBe(5);
	});

	it("counts a two cell barrack's neighbors on both of its cells once", () => {
		const rush = new RushBarrack(new Cell({ x: 5, y: 5 }));
		const wideWave = new WaveBarrack(new Cell({ x: 7, y: 5 }));
		const above = new BasicBarrack(new Cell({ x: 5, y: 6 }));
		const aboveRight = new VeterantBarrack(new Cell({ x: 6, y: 6 }));
		expect(castSpeedGain(rush, [rush, wideWave])).toBe(5);
		expect(castSpeedGain(rush, [rush, wideWave, above, aboveRight])).toBe(15);
		expect(castSpeedGain(rush, [rush, new RushBarrack(new Cell({ x: 7, y: 5 }))])).toBe(0);
	});
});
