// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../shared/position";
import { WhiteStag } from "../../recruit/implementation/white-stag";
import { FallenAntler } from "../../../area-effect/implementation/fallen-antler";
import type { BattleArmyHooks } from "../../../army/battle/battle-army";
import type { BattlePath } from "../../../path/battle/battle-path";

const setup = () => {
	const effects: unknown[] = [];
	const removed: unknown[] = [];
	const hooks = {
		addAreaEffect: (effect: unknown) => effects.push(effect),
		removeUnit: (unit: unknown) => removed.push(unit),
	} as unknown as BattleArmyHooks;
	const path = { getNodes: () => [new GridPosition({ x: 100, y: 0 })] } as unknown as BattlePath;
	const stag = new WhiteStag(new Cell({ x: 0, y: 0 })).toBattle(new GridPosition({ x: 0, y: 0 }), path, hooks);
	const antlers = () => effects.filter((effect) => effect instanceof FallenAntler).length;
	return { stag, antlers, removed };
};

describe("White Stag antlers", () => {
	it("drops one antler at 50% health and the last one on death", () => {
		const { stag, antlers, removed } = setup();
		stag.stats.takeDamage(stag.stats.maxHealth * 0.6);
		stag.tick();
		expect(antlers()).toBe(1);
		stag.stats.takeDamage(stag.stats.maxHealth);
		expect(antlers()).toBe(2);
		expect(removed).toEqual([stag]);
	});

	it("drops a single antler when killed from above 50% in one blow", () => {
		const { stag, antlers, removed } = setup();
		stag.stats.takeDamage(stag.stats.maxHealth * 2);
		expect(antlers()).toBe(1);
		expect(removed).toEqual([stag]);
	});
});
