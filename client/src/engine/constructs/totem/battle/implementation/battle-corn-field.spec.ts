// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { ArmyBuff } from "../../../../army/battle/army-buff";
import { BattleFoodEconomy } from "../../../../food/battle-food-economy";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { CornField } from "../../recruit/implementation/corn-field";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";

const setup = () => {
	const buffs = new ArmyBuff();
	const food = new BattleFoodEconomy(100, () => ({ clock: 0 }));
	let castleHit: () => void = () => {};
	const hooks = {
		alliedArmyBuffHooks: buffs.getHooks(),
		alliedFoodHooks: food.getHooks(),
		onEnemyCastleHit: (listener: () => void) => {
			castleHit = listener;
		},
	} as unknown as BattleArmyHooks;
	const grid = { cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
	const field = new CornField(new Cell({ x: 0, y: 0 })).toAllied(grid as never, hooks);
	return { field, buffs, food, hit: () => castleHit() };
};

describe("CornField", () => {
	it("is a Common Food totem at 15 gold", () => {
		const { blueprint } = new CornField(new Cell({ x: 0, y: 0 }));
		expect(blueprint.rarity).toBe(Rarity.Common);
		expect(blueprint.price).toBe(15);
	});

	it("gives 25 max food, and the food with it, at the start of battle", () => {
		const { field, food } = setup();
		const before = 100;
		field.onBattleStart();
		expect(food.maxFood).toBe(before + 25);
		expect(food.food).toBe(before + 25);
	});

	it("gives 2 unit speed stacks once, the first time an ally hits the enemy castle", () => {
		const { field, buffs, hit } = setup();
		field.onBattleStart();
		expect(buffs.unitArmyBuff.getBuff("movement-speed")).toBe(0);
		hit();
		expect(buffs.unitArmyBuff.getBuff("movement-speed")).toBe(2);
		hit();
		expect(buffs.unitArmyBuff.getBuff("movement-speed")).toBe(2);
	});
});
