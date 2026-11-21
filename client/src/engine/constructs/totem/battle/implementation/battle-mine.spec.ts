// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { ArmyBuff } from "../../../../army/battle/army-buff";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { Mine } from "../../recruit/implementation/mine";
import { Rock } from "../../../../environment/rock";
import { BattleGrid } from "../../../../grid/battle-grid";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { ArmyHooks } from "../../../../army/army";

const WIDTH = 10;
const HEIGHT = 10;
const grid = { width: WIDTH, height: HEIGHT, cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };

// A battle board reduced to a map of cells, read through the same relative-neighbor lookup as BattleGrid.
const setup = (elements: { cell: Cell; element: object }[]) => {
	const buffs = new ArmyBuff();
	const board = new Map(elements.map(({ cell, element }) => [`${cell.x},${cell.y}`, element]));
	const hooks = {
		alliedArmyBuffHooks: buffs.getHooks(),
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map((relative) => board.get(`${cell.x + relative.x},${cell.y + relative.y}`)),
		},
	} as unknown as BattleArmyHooks;
	return { hooks, vitality: () => buffs.unitArmyBuff.getBuff("vitality") };
};

const at = (x: number, y: number) => new Cell({ x, y });
// The enemy copy sits on the board turned by 180°.
const flipped = (cell: Cell) => BattleGrid.flip(grid as never, cell);

describe("Mine", () => {
	const mine = new Mine(at(2, 3));

	it("is a Common at 15 gold, giving 5 gold and 1 vitality stack", () => {
		expect(mine.blueprint.rarity).toBe(Rarity.Common);
		expect(mine.blueprint.price).toBe(15);
		expect(mine.blueprint.shopGold).toBe(5);
		expect(mine.blueprint.vitalityStacks).toBe(1);
	});

	it("gives 5 gold every time the shop is entered, with no interest", () => {
		for (const owned of [0, 4, 100]) {
			const addGold = jest.fn();
			const hooks = {
				economyHooks: { addGold, getEconomy: () => ({ amount: owned }) },
				getRelativeNeighborsInGrid: () => [undefined],
			} as unknown as ArmyHooks;
			mine.onShopEnter(hooks);
			expect(addGold).toHaveBeenCalledTimes(1);
			expect(addGold).toHaveBeenCalledWith(5);
		}
	});

	it("gives 1 vitality stack with a Rock on its star", () => {
		const { hooks, vitality } = setup([{ cell: at(3, 3), element: new Rock(at(3, 3)) }]);
		mine.toAllied(grid as never, hooks).onBattleStart();
		expect(vitality()).toBe(1);
	});

	it("gives 1 vitality stack with another Gold Mine on its star", () => {
		const other = new Mine(at(3, 3)).toAllied(grid as never, {} as BattleArmyHooks);
		const { hooks, vitality } = setup([{ cell: at(3, 3), element: other }]);
		mine.toAllied(grid as never, hooks).onBattleStart();
		expect(vitality()).toBe(1);
	});

	it("gives no buff without a Mountain on its star", () => {
		const { hooks, vitality } = setup([
			// A rock on the wrong side, and a non-Mountain piece on the star.
			{ cell: at(1, 3), element: new Rock(at(1, 3)) },
			{ cell: at(3, 3), element: { tags: ["Forest"] } },
		]);
		mine.toAllied(grid as never, hooks).onBattleStart();
		expect(vitality()).toBe(0);

		const empty = setup([]);
		mine.toAllied(grid as never, empty.hooks).onBattleStart();
		expect(empty.vitality()).toBe(0);
	});

	it("stacks one per mine", () => {
		const { hooks, vitality } = setup([
			{ cell: at(3, 3), element: new Rock(at(3, 3)) },
			{ cell: at(6, 3), element: new Rock(at(6, 3)) },
		]);
		mine.toAllied(grid as never, hooks).onBattleStart();
		new Mine(at(5, 3)).toAllied(grid as never, hooks).onBattleStart();
		expect(vitality()).toBe(2);
	});

	it("reads the star on the mirrored side for the enemy copy", () => {
		const rock = new Rock(at(3, 3)).toEnemy(grid as never);
		const enemyCell = flipped(mine.cell);
		expect(rock.cell).toEqual(flipped(at(3, 3)));

		const { hooks, vitality } = setup([{ cell: rock.cell, element: rock }]);
		mine.toEnemy(grid as never, hooks).onBattleStart();
		expect(vitality()).toBe(1);

		// A rock where the star would be without the mirror (to the right of the flipped cell) does nothing.
		const wrong = setup([{ cell: at(enemyCell.x + 1, enemyCell.y), element: new Rock(at(0, 0)) }]);
		mine.toEnemy(grid as never, wrong.hooks).onBattleStart();
		expect(wrong.vitality()).toBe(0);
	});
});
