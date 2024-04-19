import { Cell } from "../../../shared/position";
import { BasicPathTile } from "../../tile/recruit/implementation/basic-tile";
import { SlowingPathTile } from "../../tile/recruit/implementation/slowing-tile";

export class PathFixture {
	static get default() {
		return [
			new BasicPathTile(new Cell({ x: 0, y: 4 })),
			new SlowingPathTile(new Cell({ x: 0, y: 3 })),
			new SlowingPathTile(new Cell({ x: 1, y: 3 })),
			new BasicPathTile(new Cell({ x: 2, y: 3 })),
			new BasicPathTile(new Cell({ x: 2, y: 2 })),
			new BasicPathTile(new Cell({ x: 3, y: 2 })),
			new BasicPathTile(new Cell({ x: 4, y: 2 })),
			new BasicPathTile(new Cell({ x: 4, y: 1 })),
			new BasicPathTile(new Cell({ x: 5, y: 1 })),
			new BasicPathTile(new Cell({ x: 6, y: 1 })),
			new BasicPathTile(new Cell({ x: 7, y: 1 })),
			new BasicPathTile(new Cell({ x: 8, y: 1 })),
			new BasicPathTile(new Cell({ x: 9, y: 1 })),
			new BasicPathTile(new Cell({ x: 9, y: 2 })),
			new BasicPathTile(new Cell({ x: 10, y: 2 })),
			new BasicPathTile(new Cell({ x: 10, y: 3 })),
			new BasicPathTile(new Cell({ x: 11, y: 3 })),
			new BasicPathTile(new Cell({ x: 12, y: 3 })),
			new BasicPathTile(new Cell({ x: 12, y: 4 })),
			new BasicPathTile(new Cell({ x: 12, y: 5 })),
		];
	}
}

export class PathFactory {
	static get default() {
		return [
			new BasicPathTile(new Cell({ x: 0, y: 3 })),
			new BasicPathTile(new Cell({ x: 0, y: 2 })),
			new BasicPathTile(new Cell({ x: 0, y: 1 })),
			new BasicPathTile(new Cell({ x: 0, y: 0 })),
			new BasicPathTile(new Cell({ x: 1, y: 0 })),
			new BasicPathTile(new Cell({ x: 2, y: 0 })),
			new BasicPathTile(new Cell({ x: 3, y: 0 })),
			new BasicPathTile(new Cell({ x: 4, y: 0 })),
			new BasicPathTile(new Cell({ x: 5, y: 0 })),
			new BasicPathTile(new Cell({ x: 6, y: 0 })),
			new BasicPathTile(new Cell({ x: 6, y: 1 })),
			new BasicPathTile(new Cell({ x: 6, y: 2 })),
			new BasicPathTile(new Cell({ x: 6, y: 3 })),
			new BasicPathTile(new Cell({ x: 6, y: 4 })),
		];
	}
	static get round2() {
		return [
			new BasicPathTile(new Cell({ x: 0, y: 4 })),
			new BasicPathTile(new Cell({ x: 0, y: 3 })),
			new BasicPathTile(new Cell({ x: 0, y: 2 })),
			new BasicPathTile(new Cell({ x: 0, y: 1 })),
			new BasicPathTile(new Cell({ x: 0, y: 0 })),
			new BasicPathTile(new Cell({ x: 1, y: 0 })),
			new BasicPathTile(new Cell({ x: 2, y: 0 })),
			new BasicPathTile(new Cell({ x: 3, y: 0 })),
			new BasicPathTile(new Cell({ x: 4, y: 0 })),
			new BasicPathTile(new Cell({ x: 5, y: 0 })),
			new BasicPathTile(new Cell({ x: 5, y: 1 })),
			new BasicPathTile(new Cell({ x: 5, y: 2 })),
			new BasicPathTile(new Cell({ x: 5, y: 3 })),
			new BasicPathTile(new Cell({ x: 6, y: 3 })),
			new BasicPathTile(new Cell({ x: 7, y: 3 })),
			new BasicPathTile(new Cell({ x: 7, y: 4 })),
			new BasicPathTile(new Cell({ x: 7, y: 5 })),
		];
	}
}
