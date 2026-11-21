import { Cell } from "../../../shared/position";
import { PathNetwork, PathNetworkTile } from "./path-network";

const tile = (x: number, y: number): PathNetworkTile => ({ cell: new Cell({ x, y }), connectionChoice: null });
const cell = (x: number, y: number) => new Cell({ x, y });
const offsets = (cells: Cell[]) => cells.map((offset) => `${offset.x},${offset.y}`).sort();
const route = (network: PathNetwork) => network.route.map((routeCell) => `${routeCell.x},${routeCell.y}`);

const UP = "0,1";
const DOWN = "0,-1";
const LEFT = "-1,0";
const RIGHT = "1,0";

// Square ring around (1,1) between the door (2,2), entered from the right, and the castle end (0,2), left through its left
// edge into the castle that stands off the board.
//   E o D      E = castle end (0,2), D = door (2,2)
//   o . o
//   o o o
const from = cell(2, 2);
const to = cell(0, 2);
const ring = () => [tile(2, 2), tile(1, 2), tile(0, 2), tile(2, 1), tile(0, 1), tile(2, 0), tile(1, 0), tile(0, 0)];
const shortcut = ["2,2", "1,2", "0,2"];
const bigTurn = ["2,2", "2,1", "2,0", "1,0", "0,0", "0,1", "0,2"];

describe("PathNetwork shapes", () => {
	it("gives every tile a direction, on the path or not", () => {
		const network = new PathNetwork(from, to, [tile(5, 5), tile(7, 5), tile(7, 4), tile(8, 4)]);
		expect(offsets(network.connectionsAt(cell(5, 5)))).toEqual(offsets([cell(0, 1), cell(0, -1)]));
		expect(offsets(network.connectionsAt(cell(8, 4)))).toEqual([LEFT, RIGHT].sort());
		expect(offsets(network.connectionsAt(cell(7, 4)))).toEqual([UP, RIGHT].sort());
	});

	it("takes the shortest route at junctions by default", () => {
		const network = new PathNetwork(from, to, ring());
		expect(network.complete).toBe(true);
		expect(route(network)).toEqual(shortcut);
	});

	it("follows a junction's chosen connection", () => {
		const tiles = ring();
		tiles[0]!.connectionChoice = [cell(1, 0), cell(0, -1)]; // door: right and down, the big turn
		tiles[2]!.connectionChoice = [cell(-1, 0), cell(0, -1)]; // castle end: left, into the castle, and down
		const network = new PathNetwork(from, to, tiles);
		expect(route(network)).toEqual(bigTurn);
		expect(network.complete).toBe(true);
	});

	it("stops where tiles do not point at each other", () => {
		const tiles = ring();
		tiles[0]!.connectionChoice = [cell(1, 0), cell(0, -1)]; // door goes down, castle end still faces the shortcut
		const network = new PathNetwork(from, to, tiles);
		expect(network.complete).toBe(false);
		expect(route(network)).toEqual(["2,2", "2,1", "2,0", "1,0", "0,0", "0,1"]);
	});
});

describe("PathNetwork right-click", () => {
	it("lists tiles with 3 or more neighbors, counting the outside one at the door and castle end", () => {
		expect(offsets(new PathNetwork(from, to, ring()).junctions)).toEqual(["0,2", "2,2"]);
	});

	it("cycles every pair of a junction", () => {
		const tiles = ring();
		const seen = new Set<string>();
		for (let i = 0; i < 3; i++) {
			const network = new PathNetwork(from, to, tiles);
			seen.add(offsets(network.connectionsAt(from)).join(" "));
			tiles[0]!.connectionChoice = network.nextChoiceAt(from)!.choice;
		}
		expect(seen).toEqual(
			new Set([[RIGHT, LEFT].sort().join(" "), [RIGHT, DOWN].sort().join(" "), [DOWN, LEFT].sort().join(" ")]),
		);
	});

	it("turns a neighboring junction towards a tile it does not connect", () => {
		// Default is the shortcut, so the door does not connect (2,1). Clicking (2,1) turns the door down, keeping its entry.
		const change = new PathNetwork(from, to, ring()).nextChoiceAt(cell(2, 1));
		expect(change?.cell).toEqual(from);
		expect(offsets(change!.choice)).toEqual([RIGHT, DOWN].sort());
	});

	it("does nothing on a tile already connected to its neighboring junctions", () => {
		expect(new PathNetwork(from, to, ring()).nextChoiceAt(cell(1, 2))).toBeNull();
	});
});
