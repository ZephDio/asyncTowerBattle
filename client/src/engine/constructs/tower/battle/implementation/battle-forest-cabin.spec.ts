// Loaded first: the tower modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../../shared/position";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { Rarity } from "../../../../../shared/traits/engine/rarity";
import { castSpeedFromSeconds } from "../../../../../shared/seconds";
import { Forest } from "../../../../environment/forest";
import { Rock } from "../../../../environment/rock";
import { BattleGrid } from "../../../../grid/battle-grid";
import { BattleSlowingBullet } from "../../../../projectile/battle/implementation/battle-slowing-bullet";
import { Hindered } from "../../../../stats/status/hindered";
import { BattleForestCabin } from "./battle-forest-cabin";
import { ForestCabin } from "../../recruit/implementation/forest-cabin";
import { ForestCabinBlueprint } from "../../blueprint/implementation/forest-cabin-blueprint";
import type { BattleArmyHooks } from "../../../../army/battle/battle-army";
import type { AnyBattleUnit } from "../../../../units/battle/battle-unit";

const grid = { width: 10, height: 10, cellToGrid: (cell: Cell) => new GridPosition({ x: cell.x, y: cell.y }) };
const at = (x: number, y: number) => new Cell({ x, y });

const setup = (elements: { cell: Cell; element: object }[]) => {
	const board = new Map(elements.map(({ cell, element }) => [`${cell.x},${cell.y}`, element]));
	return {
		gridHooks: {
			getRelativeNeighborsInArmy: (cell: Cell, relatives: Cell[]) =>
				relatives.map((relative) => board.get(`${cell.x + relative.x},${cell.y + relative.y}`)),
		},
	} as unknown as BattleArmyHooks;
};

describe("ForestCabin", () => {
	const blueprint = new ForestCabinBlueprint({});

	it("is a Common at 10 gold shooting 8 damage every 1.15 s for 1 food", () => {
		expect(blueprint.rarity).toBe(Rarity.Common);
		expect(blueprint.price).toBe(10);
		expect(blueprint.stats.projectileDamage).toBe(8);
		expect(blueprint.stats.castSpeed).toBeCloseTo(castSpeedFromSeconds(1.15));
		expect(blueprint.stats.foodConsumptionOnCast).toBe(1);
		expect(blueprint.tags).toEqual(expect.arrayContaining(["Tower", "Forest"]));
	});

	it("hits its left and right cells and has its stars above and below", () => {
		const cells = (list: Cell[]) => list.map(({ x, y }) => [x, y]);
		expect(cells(blueprint.targetZone.relativeCells)).toEqual([
			[-1, 0],
			[1, 0],
		]);
		expect(cells(blueprint.patternEffect.getRelativeCells(BoardOrientation.Normal))).toEqual([
			[0, 1],
			[0, -1],
		]);
	});

	it.each([
		["no forest", [], 1],
		["one forest", [{ cell: at(3, 4), element: new Forest(at(3, 4)) }], 1.1],
		[
			"two forests, a cabin among them",
			[
				{ cell: at(3, 4), element: new Forest(at(3, 4)) },
				{ cell: at(3, 2), element: new ForestCabin(at(3, 2)) },
			],
			1.2,
		],
		["a rock", [{ cell: at(3, 4), element: new Rock(at(3, 4)) }], 1],
	])("casts with %s on its stars at base x%s", (_name, elements, factor) => {
		const normal = new ForestCabin(at(3, 3)).toAllied(grid as never, setup(elements)) as BattleForestCabin;
		normal.onBattleStart();
		expect(normal.stats.castSpeed).toBeCloseTo(castSpeedFromSeconds(1.15) * factor);

		// The enemy board is the same board turned by 180°
		const turned = elements.map(({ cell, element }) => ({ cell: BattleGrid.flip(grid as never, cell), element }));
		const mirrored = new ForestCabin(at(3, 3)).toEnemy(grid as never, setup(turned)) as BattleForestCabin;
		mirrored.onBattleStart();
		expect(mirrored.stats.castSpeed).toBeCloseTo(castSpeedFromSeconds(1.15) * factor);
	});

	it("mirrors onto the flipped cell", () => {
		const recruit = new ForestCabin(at(3, 3));
		const enemy = recruit.toEnemy(grid as never, setup([]));
		expect(enemy.cell).toEqual(BattleGrid.flip(grid as never, at(3, 3)));
	});

	it("shoots a bullet that slows the unit it hits by 50% for 2 seconds", () => {
		const added: unknown[] = [];
		const target = {
			position: new GridPosition({ x: 5, y: 5 }),
			takeHit: jest.fn(),
			addCondition: (condition: unknown) => added.push(condition),
		} as unknown as AnyBattleUnit;
		const removed: unknown[] = [];
		const hooks = { removeProjectile: (p: unknown) => removed.push(p) } as unknown as BattleArmyHooks;
		const bullet = new ForestCabin(at(3, 3)).getProjectile(hooks, target, new GridPosition({ x: 5, y: 5 }), 8);

		bullet.hit();

		expect(bullet).toBeInstanceOf(BattleSlowingBullet);
		expect(target.takeHit).toHaveBeenCalledWith(8);
		expect(added).toHaveLength(1);
		expect(added[0]).toBeInstanceOf(Hindered);
		expect((added[0] as Hindered).duration).toBe(64);
		expect((added[0] as Hindered).percent).toBe(50);
		expect(removed).toEqual([bullet]);
	});
});
