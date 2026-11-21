// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../match-maker/board-serializer";
import { deserializeBoard, serializeBoard } from "../match-maker/board-serializer";
import { LocalMatchMaker } from "../match-maker/local-match-maker";
import { ArmyFactory } from "../army/army-fixtures";
import { Battlefield } from "../battle/battlefield/battlefield";
import { PathFinder } from "../battle/path-finder";
import { Faction } from "../menu/main-menu";
import { BoardOrientation } from "../../shared/traits/engine/core/board-orientation";
import { Cell, GridPosition } from "../../shared/position";
import { STANDARD_CELL_SIZE } from "../grid/tgrid";
import { armyGridSize } from "../grid/grid-sizes";
import { Army } from "../army/army";
import { castleGeometry } from "./castle-geometry";

const S = STANDARD_CELL_SIZE;
const { width: W, height: H } = armyGridSize(1);
const at = (x: number, y: number) => new GridPosition({ x, y });
const cellCenter = (x: number, y: number) => at((x + 0.5) * S, (y + 0.5) * S);
const close = (a: GridPosition, b: GridPosition) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-6;

describe("the castle off the grid", () => {
	it("is not a grid element: the board keeps its cell, the castle stands beside it", () => {
		const army = ArmyFactory.default(Faction.Elf);

		expect(army.grid.getElements()).not.toContain(army.castle);
		expect(army.castle.cell.equals(new Cell({ x: 0, y: H - 1 }))).toBe(true);
		// The castle is a sprite overhanging the top row, centred on the row's top edge, and drawn with the grid.
		expect(army.castle.position).toEqual(at(-S, (H + 0.7) * S));
		expect(army.grid.getDrawables()).toContain(army.castle);
	});

	it("locks the top left cell, where the path ends, as it locked the cell under the castle", () => {
		const { grid } = ArmyFactory.default(Faction.Elf);

		expect(grid.getCastleEntryCell().equals(new Cell({ x: 0, y: H - 1 }))).toBe(true);
		expect(grid.isLockedCell(new Cell({ x: 0, y: H - 1 }))).toBe(true);
		expect(grid.isLockedCell(new Cell({ x: 0, y: H - 2 }))).toBe(false);
	});

	it("ends the path on the top left cell, which it leaves by its left edge", () => {
		const army = ArmyFactory.default(Faction.Elf);

		expect(army.pathNetwork.complete).toBe(true);
		expect(army.path[0]?.equals(new Cell({ x: W - 1, y: H - 1 }))).toBe(true);
		expect(army.path.at(-1)?.equals(new Cell({ x: 0, y: H - 1 }))).toBe(true);
		const last = army.pathNetwork.connectionsAt(new Cell({ x: 0, y: H - 1 }));
		expect(last.map((offset) => `${offset.x},${offset.y}`).sort()).toEqual(["-1,0", "0,-1"]);
	});

	it("does not reach the castle when the top left tile is missing", () => {
		const army = ArmyFactory.default(Faction.Elf);
		army.grid.deleteElement(army.grid.getElement(army.grid.getCastleEntryCell())!);

		expect(army.pathNetwork.complete).toBe(false);
	});

	it("stays beside the top row when the grid grows", () => {
		const army = ArmyFactory.default(Faction.Elf);

		army.grid.grow({ width: W + 1, height: H + 1 });

		expect(army.castle.cell.equals(new Cell({ x: 0, y: H }))).toBe(true);
		expect(army.grid.getCastleEntryCell().equals(new Cell({ x: 0, y: H }))).toBe(true);
		expect(army.grid.isLockedCell(new Cell({ x: 0, y: H }))).toBe(true);
	});

	it("is hovered through the block beside the top row, not through the cells", () => {
		const { grid } = ArmyFactory.default(Faction.Elf);
		expect(grid.isOverCastle(grid.gridToScreenPosition(at(-S, (H + 0.7) * S)))).toBe(true);
		expect(grid.isOverCastle(grid.gridToScreenPosition(at(-S, (H - 2) * S)))).toBe(false);
		expect(grid.isOverCastle(grid.gridToScreenPosition(at(S / 4, (H - 0.5) * S)))).toBe(false);
		expect(grid.isOverCastle(grid.gridToScreenPosition(at(-3.1 * S, H * S)))).toBe(false);
	});
});

describe("the castle geometry", () => {
	it("mirrors the block through the centre of the battle grid", () => {
		const allied = castleGeometry(new Cell({ x: 0, y: H - 1 }), BoardOrientation.Normal, W);
		const enemy = castleGeometry(new Cell({ x: W - 1, y: H }), BoardOrientation.Mirrored, W);
		const reflect = (point: GridPosition) => at(W * S - point.x, 2 * H * S - point.y);

		// The artwork is upright and lifted on both sides; only the doors mirror vertically.
		expect(enemy.position).toEqual(at(W * S - allied.position.x, allied.position.y));
		expect(close(reflect(allied.doorPosition), enemy.doorPosition)).toBe(true);
		expect(close(reflect(allied.spawnPosition), enemy.spawnPosition)).toBe(true);
	});
});

const battle = (opponent: Army) =>
	new Battlefield(
		ArmyFactory.default(Faction.Elf),
		opponent,
		() => {},
		() => 0.5,
		{ clock: 0 },
	);

const walk = (spawn: GridPosition, nodes: GridPosition[]) => {
	const finder = new PathFinder(nodes);
	let position = spawn.clone();
	const visited = [position.clone()];
	for (let i = 0; i < 5000 && !finder.isArrived; i++) {
		position = finder.getNextPosition(position, 0.4);
		visited.push(position.clone());
	}
	return { visited, arrived: finder.isArrived };
};

describe("the travel of the units", () => {
	const field = battle(LocalMatchMaker.board(1).army);

	it("puts both castles off the battle grid, beside the seam between the two boards", () => {
		const [allied, enemy] = [field.alliedArmy.castle, field.enemyArmy.castle];

		expect(field.grid.castles).toEqual([allied, enemy]);
		expect([...field.grid.tiles.values()]).not.toContain(allied);
		expect([...field.grid.tiles.values()]).not.toContain(enemy);
		expect(allied.position).toEqual(at(-S, (H + 0.7) * S));
		expect(allied.doorPosition).toEqual(at(0, (H - 0.5) * S));
		expect(allied.spawnPosition).toEqual(at(0, (H + 0.5) * S));
		expect(enemy.position).toEqual(at((W + 1.125) * S, (H + 0.74) * S));
		expect(enemy.doorPosition).toEqual(at(W * S, (H + 0.5) * S));
		expect(enemy.spawnPosition).toEqual(at(W * S, (H - 0.5) * S));
		expect(enemy.orientation).toBe(BoardOrientation.Mirrored);
	});

	it("makes the enemy units enter our board by the right edge of our door cell and leave it by the left edge of our top left cell", () => {
		const nodes = field.alliedArmy.path.getNodes();

		// They spawn on the right edge of the door cell, so they never share the point our castle spawns at.
		expect(close(field.enemyArmy.castle.spawnPosition, at(W * S, (H - 0.5) * S))).toBe(true);
		expect(close(nodes[0]!, cellCenter(W - 1, H - 1))).toBe(true);
		expect(close(nodes.at(-2)!, cellCenter(0, H - 1))).toBe(true);
		expect(close(nodes.at(-1)!, field.alliedArmy.castle.doorPosition)).toBe(true);
	});

	it("makes our units enter the enemy board by the left edge of its door cell, mirrored, and leave it by the right edge of its top right cell", () => {
		const nodes = field.enemyArmy.path.getNodes();

		expect(close(field.alliedArmy.castle.spawnPosition, at(0, (H + 0.5) * S))).toBe(true);
		expect(close(nodes[0]!, cellCenter(0, H))).toBe(true);
		expect(close(nodes.at(-2)!, cellCenter(W - 1, H))).toBe(true);
		expect(close(nodes.at(-1)!, field.enemyArmy.castle.doorPosition)).toBe(true);
	});

	it("never lets a unit spawn where the opposite units arrive", () => {
		const { alliedArmy, enemyArmy } = field;

		expect(close(alliedArmy.castle.spawnPosition, alliedArmy.castle.doorPosition)).toBe(false);
		expect(close(enemyArmy.castle.spawnPosition, enemyArmy.castle.doorPosition)).toBe(false);
		// What our units walk to (the enemy door) is not where the enemy's spawn, and the other way round.
		expect(close(alliedArmy.castle.spawnPosition, enemyArmy.castle.doorPosition)).toBe(false);
		expect(close(enemyArmy.castle.spawnPosition, alliedArmy.castle.doorPosition)).toBe(false);
	});

	it("walks the enemy units from the right of our door cell over our top left cell to our castle's door", () => {
		const { visited, arrived } = walk(field.enemyArmy.castle.spawnPosition, field.alliedArmy.path.getNodes());
		const door = field.alliedArmy.castle.doorPosition;
		const onTopLeftCell = visited.filter(
			(position) => position.x < S && position.y > (H - 1) * S && position.y < H * S,
		);

		expect(arrived).toBe(true);
		expect(onTopLeftCell.length).toBeGreaterThan(0);
		// Every step stays on the board or on the right of the door cell, and ends a step before our door.
		expect(visited.every((position) => position.x >= 0)).toBe(true);
		expect(Math.hypot(visited.at(-1)!.x - door.x, visited.at(-1)!.y - door.y)).toBeLessThan(1.5);
	});

	it("walks our units the mirrored way, from the left of the enemy's door cell to its castle's door", () => {
		const { visited, arrived } = walk(field.alliedArmy.castle.spawnPosition, field.enemyArmy.path.getNodes());
		const door = field.enemyArmy.castle.doorPosition;
		const onTopRightCell = visited.filter(
			(position) => position.x > (W - 1) * S && position.y > H * S && position.y < (H + 1) * S,
		);

		expect(arrived).toBe(true);
		expect(onTopRightCell.length).toBeGreaterThan(0);
		expect(visited.every((position) => position.x <= W * S)).toBe(true);
		expect(Math.hypot(visited.at(-1)!.x - door.x, visited.at(-1)!.y - door.y)).toBeLessThan(1.5);
	});

	it("spawns the units of each castle on its spawn point, not on its door", () => {
		const spawned: GridPosition[] = [];
		const { castle } = field.alliedArmy;
		castle.hooks = {
			...castle.hooks,
			getDefaultUnit: () => ({ toBattle: (position: GridPosition) => position }) as never,
			addUnits: ((position: GridPosition) => spawned.push(position)) as never,
			getEnemyPath: () => field.alliedArmy.path,
		};
		castle.onCastResolve();

		expect(spawned).toHaveLength(1);
		expect(close(spawned[0]!, castle.spawnPosition)).toBe(true);
		expect(spawned[0]).not.toBe(castle.spawnPosition);
	});
});

describe("boards stored before the castle left the grid", () => {
	it("get the missing last tile of the path on their top left cell", () => {
		const { army, randomSeed } = LocalMatchMaker.board(1);
		const board = serializeBoard(army, 1, randomSeed);
		const legacy = {
			...board,
			elements: board.elements.filter(
				(element) => !(element.kind === "path" && element.cell.x === 0 && element.cell.y === H - 1),
			),
		};

		const opponent = deserializeBoard(JSON.parse(JSON.stringify(legacy)));

		expect(opponent.army.pathNetwork.complete).toBe(true);
		const rebuilt = serializeBoard(opponent.army, 1, opponent.randomSeed);
		expect(rebuilt.elements).toHaveLength(board.elements.length);
		expect(rebuilt.elements).toEqual(expect.arrayContaining(board.elements));
	});

	it("keep the castle element, which now only tells the faction", () => {
		const { army, randomSeed } = LocalMatchMaker.board(1);
		const board = serializeBoard(army, 1, randomSeed);

		expect(board.elements.filter((element) => element.kind === "castle")).toEqual([
			{ kind: "castle", cell: { x: 0, y: H - 1 } },
		]);
	});
});
