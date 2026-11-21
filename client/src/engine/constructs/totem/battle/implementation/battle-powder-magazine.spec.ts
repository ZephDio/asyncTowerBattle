// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { ArmyBuff } from "../../../../army/battle/army-buff";
import { secondsToFrame } from "../../../../../shared/seconds";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { PowderMagazine } from "../../recruit/implementation/powder-magazine";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";

// An army with just what a magazine reads: the tower buffs, the battle clock and the seeded random.
const setup = (count = 1) => {
	const buffs = new ArmyBuff();
	const clock = { clock: 0 };
	const random = jest.fn(() => 0.9);
	const hooks = {
		alliedArmyBuffHooks: buffs.getHooks(),
		timer: () => clock,
		random,
	} as unknown as BattleArmyHooks;
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const magazines = Array.from({ length: count }, (_, i) =>
		new PowderMagazine(new Cell({ x: i * 5, y: 0 })).toAllied(grid as never, hooks),
	);
	const tickTo = (frame: number) => {
		while (clock.clock < frame) {
			clock.clock++;
			for (const magazine of magazines) magazine.tick();
		}
	};
	const tower = (buff: "projectile-damage" | "cast-speed") => buffs.towerArmyBuff.getBuff(buff);
	return { magazines, tickTo, tower, random };
};

const blueprint = new PowderMagazine(new Cell({ x: 0, y: 0 })).blueprint;

describe("PowderMagazine", () => {
	it("is an Uncommon at 15 gold", () => {
		expect(blueprint.rarity).toBe(Rarity.Uncommon);
		expect(blueprint.price).toBe(15);
	});

	it("gives 4 projectile-damage stacks at the start of battle, then 5 cast-speed stacks after 15 s", () => {
		const { magazines, tickTo, tower, random } = setup();
		expect(blueprint.startDamageStacks).toBe(4);
		expect(blueprint.lateCastSpeedStacks).toBe(5);

		for (const magazine of magazines) magazine.onBattleStart();
		expect(tower("projectile-damage")).toBe(4);
		expect(tower("cast-speed")).toBe(0);

		tickTo(secondsToFrame(15));
		expect(tower("cast-speed")).toBe(0);

		tickTo(secondsToFrame(30));
		expect(tower("projectile-damage")).toBe(4);
		expect(tower("cast-speed")).toBe(5);
		// No coin flip any more.
		expect(random).not.toHaveBeenCalled();
	});

	it("stacks with a second magazine", () => {
		const { magazines, tickTo, tower } = setup(2);

		for (const magazine of magazines) magazine.onBattleStart();
		tickTo(secondsToFrame(16));

		expect(tower("projectile-damage")).toBe(8);
		expect(tower("cast-speed")).toBe(10);
	});
});
