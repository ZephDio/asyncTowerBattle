import { Cell } from "../../../shared/position";

// What the network needs from a path tile. `connectionChoice` is the pair of directions a junction was set to.
export type PathNetworkTile = { cell: Cell; connectionChoice: Cell[] | null };

// Every path tile always connects two directions (unit offsets), derived from its neighboring tiles:
// - no neighbor: vertical straight, one neighbor: straight through it, two neighbors: connects both;
// - three or four neighbors (a junction): its `connectionChoice`, or by default the shortest door-to-castle route.
// The door tile and the castle-end tile also count an outside neighbor above them (the enemy half, the castle).
// The path starts at the door and follows tiles that point at each other; it is complete when it leads up into the castle.
export class PathNetwork {
	private byCell: Map<string, PathNetworkTile>;
	private neighbors = new Map<string, Cell[]>();
	private connections = new Map<string, Cell[]>();
	route: Cell[] = [];
	complete = false;

	constructor(
		public from: Cell,
		public to: Cell,
		tiles: PathNetworkTile[],
	) {
		this.byCell = new Map(tiles.map((tile) => [cellKey(tile.cell), tile]));
		for (const tile of tiles) {
			this.neighbors.set(cellKey(tile.cell), this.findNeighbors(tile.cell));
		}
		for (const tile of tiles) {
			this.connections.set(cellKey(tile.cell), this.findConnections(tile));
		}
		this.walk();
	}

	connectionsAt(cell: Cell) {
		return this.connections.get(cellKey(cell)) ?? [UP, DOWN];
	}

	get junctions() {
		return [...this.byCell.values()].map((tile) => tile.cell).filter((cell) => this.neighborsAt(cell).length >= 3);
	}

	// What right-clicking `cell` changes. On a junction: its next pair of directions. On a tile next to a junction that
	// does not point at it: that junction turns towards it, keeping the side the path enters by.
	nextChoiceAt(cell: Cell): { cell: Cell; choice: Cell[] } | null {
		const neighbors = this.neighborsAt(cell);
		if (neighbors.length >= 3) {
			const pairs = pairsOf(neighbors);
			const current = pairs.findIndex((pair) => samePair(pair, this.connectionsAt(cell)));
			const next = pairs[(current + 1) % pairs.length];
			return next ? { cell, choice: next } : null;
		}
		for (const offset of neighbors) {
			const junction = cell.add(offset);
			if (!this.byCell.has(cellKey(junction)) || this.neighborsAt(junction).length < 3) continue;
			const towardsCell = opposite(offset);
			const junctionConnections = this.connectionsAt(junction);
			if (junctionConnections.some((connection) => connection.equals(towardsCell))) continue;
			const keep = this.entryAt(junction) ?? junctionConnections[0]!;
			return { cell: junction, choice: [keep, towardsCell] };
		}
		return null;
	}

	private neighborsAt(cell: Cell) {
		return this.neighbors.get(cellKey(cell)) ?? [];
	}

	// Direction the path enters `cell` from, if the path goes through it.
	private entryAt(cell: Cell) {
		const index = this.route.findIndex((routeCell) => routeCell.equals(cell));
		if (index === -1) return undefined;
		const previous = this.route[index - 1];
		return previous ? offsetBetween(cell, previous) : UP;
	}

	private findNeighbors(cell: Cell) {
		const offsets = [UP, DOWN, LEFT, RIGHT].filter((offset) => this.byCell.has(cellKey(cell.add(offset))));
		const outside = cell.equals(this.from) || cell.equals(this.to);
		return outside && !offsets.some((offset) => offset.equals(UP)) ? [UP, ...offsets] : offsets;
	}

	private findConnections(tile: PathNetworkTile) {
		const neighbors = this.neighborsAt(tile.cell);
		const [first, second] = neighbors;
		if (!first) return [UP, DOWN];
		if (!second) return [first, opposite(first)];
		if (neighbors.length === 2) return [first, second];
		const choice = tile.connectionChoice;
		if (choice?.length === 2 && choice.every((offset) => neighbors.some((neighbor) => neighbor.equals(offset)))) {
			return choice;
		}
		return this.defaultJunctionConnections(tile.cell) ?? pairsOf(neighbors)[0]!;
	}

	// How the shortest complete route through `cell` crosses it.
	private defaultJunctionConnections(cell: Cell) {
		const route = completeRoutes(this.from, this.to, [...this.byCell.keys()]).find((candidate) =>
			candidate.some((routeCell) => routeCell.equals(cell)),
		);
		if (!route) return undefined;
		const index = route.findIndex((routeCell) => routeCell.equals(cell));
		const previous = route[index - 1];
		const next = route[index + 1];
		return [previous ? offsetBetween(cell, previous) : UP, next ? offsetBetween(cell, next) : UP];
	}

	private walk() {
		let cell = this.from;
		let entry = UP;
		const visited = new Set<string>();
		while (this.byCell.has(cellKey(cell)) && !visited.has(cellKey(cell))) {
			const connections = this.connectionsAt(cell);
			if (!connections.some((connection) => connection.equals(entry))) return;
			visited.add(cellKey(cell));
			this.route.push(cell);
			const exit = connections.find((connection) => !connection.equals(entry)) ?? entry;
			if (cell.equals(this.to) && exit.equals(UP)) {
				this.complete = true;
				return;
			}
			cell = cell.add(exit);
			entry = opposite(exit);
		}
	}
}

const UP = new Cell({ x: 0, y: 1 });
const DOWN = new Cell({ x: 0, y: -1 });
const LEFT = new Cell({ x: -1, y: 0 });
const RIGHT = new Cell({ x: 1, y: 0 });

// Cell.toHash concatenates digits, so (1, 12) and (11, 2) would collide.
const cellKey = (cell: Cell) => `${cell.x},${cell.y}`;
const opposite = (offset: Cell) => new Cell({ x: -offset.x, y: -offset.y });
const offsetBetween = (from: Cell, to: Cell) => new Cell({ x: to.x - from.x, y: to.y - from.y });
const samePair = (a: Cell[], b: Cell[]) => a.length === b.length && a.every((offset) => b.some((other) => other.equals(offset)));
const pairsOf = (offsets: Cell[]) => offsets.flatMap((a, i) => offsets.slice(i + 1).map((b) => [a, b]));

const MAX_ROUTES = 256;
let routesCache: { key: string; routes: Cell[][] } | undefined;

// Every simple route from `from` to `to` over the tile cells, shortest first. Capped so a large block of tiles cannot
// blow up the search, and cached on the tile layout since the shop asks for it every frame.
function completeRoutes(from: Cell, to: Cell, tileKeys: string[]) {
	const key = [cellKey(from), cellKey(to), ...[...tileKeys].sort()].join(";");
	if (routesCache?.key === key) return routesCache.routes;

	const tileCells = new Set(tileKeys);
	const routes: Cell[][] = [];
	const route: Cell[] = [];
	const visited = new Set<string>();
	const explore = (cell: Cell) => {
		if (routes.length >= MAX_ROUTES) return;
		route.push(cell);
		visited.add(cellKey(cell));
		if (cell.equals(to)) {
			routes.push([...route]);
		} else {
			for (const neighbor of cell.surrounding()) {
				const neighborKey = cellKey(neighbor);
				if (tileCells.has(neighborKey) && !visited.has(neighborKey)) explore(neighbor);
			}
		}
		route.pop();
		visited.delete(cellKey(cell));
	};
	if (tileCells.has(cellKey(from))) explore(from);

	routes.sort((a, b) => a.length - b.length);
	routesCache = { key, routes };
	return routes;
}
