// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { ArmyBuff } from "../../../../army/battle/army-buff";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { Science } from "../../../../../shared/traits/engine/science";
import { Cauldron } from "../../recruit/implementation/cauldron";
import { WitchHouse } from "../../../tower/recruit/implementation/witch-house";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";

const setup = (count: number) => {
	const buffs = new ArmyBuff();
	const hooks = { alliedArmyBuffHooks: buffs.getHooks() } as unknown as BattleArmyHooks;
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const puddle = new WitchHouse(new Cell({ x: 5, y: 5 })).getAreaEffect(hooks, new GridPosition({ x: 0, y: 0 }));
	const placeCauldron = (index: number) =>
		new Cauldron(new Cell({ x: index, y: 0 })).toAllied(grid as never, hooks).onBattleStart();
	for (let i = 0; i < count; i++) placeCauldron(i);
	return { puddle, placeCauldron };
};

const blueprint = new Cauldron(new Cell({ x: 0, y: 0 })).blueprint;

describe("Cauldron", () => {
	it("is an Epic 1x1 totem at 30 gold, gated behind the Witchcraft science", () => {
		expect(blueprint.rarity).toBe(Rarity.Epic);
		expect(blueprint.price).toBe(30);
		expect(blueprint.requiredScience).toBe(Science.Witchcraft);
		expect(new Cauldron(new Cell({ x: 0, y: 0 })).gridShape.cells).toHaveLength(1);
	});

	it("leaves the Witch House's poison at 6 damage/s without a Cauldron", () => {
		expect(setup(0).puddle.damagePerSecond()).toBe(6);
	});

	it("adds 20% to the poison damage, and stacks with another Cauldron", () => {
		expect(setup(1).puddle.damagePerSecond()).toBeCloseTo(7.2);
		expect(setup(2).puddle.damagePerSecond()).toBeCloseTo(8.4);
	});

	it("applies to puddles already on the ground when a Cauldron comes later", () => {
		const { puddle, placeCauldron } = setup(0);
		placeCauldron(0);
		expect(puddle.damagePerSecond()).toBeCloseTo(7.2);
	});

	it("makes the Witch House itself deal no damage", () => {
		expect(new WitchHouse(new Cell({ x: 0, y: 0 })).stats.hasProjectileDamage()).toBe(false);
	});
});
