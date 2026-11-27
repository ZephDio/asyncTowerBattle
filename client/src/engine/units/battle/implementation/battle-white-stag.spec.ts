// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../shared/position";
import { ArmyBuff } from "../../../army/battle/army-buff";
import { BattleRandomSeed } from "../../../battle/battle-random-seed";
import { WhiteStag } from "../../recruit/implementation/white-stag";
import { Butchery } from "../../../constructs/totem/recruit/implementation/butchery";
import { RedObelisk } from "../../../constructs/totem/recruit/implementation/obelisk";
import { FallenAntler } from "../../../area-effect/implementation/fallen-antler";
import type { BattleArmyHooks } from "../../../army/battle/battle-army";
import type { BattlePath } from "../../../path/battle/battle-path";
import type { AnyBattleUnit } from "../battle-unit";

const at = (x: number, y: number) => new Cell({ x, y });
const grid = { width: 10, height: 10, cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };

const setup = () => {
	const effects: unknown[] = [];
	const units: AnyBattleUnit[] = [];
	const random = new BattleRandomSeed(1);
	const hooks = {
		addAreaEffect: (effect: unknown) => effects.push(effect),
		removeUnit: (unit: AnyBattleUnit) => units.splice(units.indexOf(unit), 1),
		getAlliedUnits: () => units,
		random: () => random.random(),
		triggerFurry: () => {},
		alliedArmyBuffHooks: new ArmyBuff().getHooks(),
		gridHooks: { getRelativeNeighborsInArmy: () => [] },
	} as unknown as BattleArmyHooks;
	const path = { getNodes: () => [new GridPosition({ x: 100, y: 0 })] } as unknown as BattlePath;
	const stag = new WhiteStag(at(0, 0)).toBattle(new GridPosition({ x: 0, y: 0 }), path, hooks);
	units.push(stag);
	const antlers = () => effects.filter((effect) => effect instanceof FallenAntler).length;
	return { stag, units, hooks, antlers };
};

describe("White Stag antlers", () => {
	it("drops one antler going under 50% health and the last one on death", () => {
		const { stag, antlers, units } = setup();
		stag.stats.takeDamage(stag.stats.maxHealth * 0.6);
		stag.tick();
		expect(antlers()).toBe(1);
		stag.stats.takeDamage(stag.stats.maxHealth);
		expect(antlers()).toBe(2);
		expect(units).toEqual([]);
	});

	it("drops both when a shot kills it from above 50%", () => {
		const { stag, antlers, units } = setup();
		stag.stats.takeDamage(stag.stats.maxHealth * 2);
		expect(antlers()).toBe(2);
		expect(units).toEqual([]);
	});

	describe("sacrificed", () => {
		it("drops one antler when the Butchery takes it from full health", () => {
			const { stag, antlers, units, hooks } = setup();
			new Butchery(at(3, 3)).toAllied(grid as never, hooks).onCastResolve();
			expect(antlers()).toBe(1);
			expect(units).toEqual([]);
			expect(stag.antlers).toBe(1);
		});

		it("drops one antler when the Red Obelisk takes it from full health", () => {
			const { antlers, units, hooks } = setup();
			new RedObelisk(at(3, 3)).toAllied(grid as never, hooks).onCastResolve();
			expect(antlers()).toBe(1);
			expect(units).toEqual([]);
		});

		it("drops its last antler when sacrificed after losing the first", () => {
			const { stag, antlers, hooks } = setup();
			stag.stats.takeDamage(stag.stats.maxHealth * 0.6);
			stag.tick();
			new Butchery(at(3, 3)).toAllied(grid as never, hooks).onCastResolve();
			expect(antlers()).toBe(2);
		});
	});
});
