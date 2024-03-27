import { ArmyPath, PathTile } from "./path";

export class PathFixture {
	static get defaultAllied() {
		return new ArmyPath([
			new PathTile({ gridX: 0, gridY: 5 }, "normal"),
			new PathTile({ gridX: 0, gridY: 4 }, "normal"),
			new PathTile({ gridX: 0, gridY: 3 }, "normal"),
			new PathTile({ gridX: 1, gridY: 3 }, "normal"),
			new PathTile({ gridX: 2, gridY: 3 }, "normal"),
			new PathTile({ gridX: 2, gridY: 2 }, "normal"),
			new PathTile({ gridX: 3, gridY: 2 }, "normal"),
			new PathTile({ gridX: 4, gridY: 2 }, "normal"),
			new PathTile({ gridX: 4, gridY: 1 }, "normal"),
			new PathTile({ gridX: 5, gridY: 1 }, "normal"),
			new PathTile({ gridX: 6, gridY: 1 }, "normal"),
			new PathTile({ gridX: 7, gridY: 1 }, "normal"),
			new PathTile({ gridX: 8, gridY: 1 }, "normal"),
			new PathTile({ gridX: 9, gridY: 1 }, "normal"),
			new PathTile({ gridX: 9, gridY: 2 }, "normal"),
			new PathTile({ gridX: 10, gridY: 2 }, "normal"),
			new PathTile({ gridX: 10, gridY: 3 }, "normal"),
			new PathTile({ gridX: 11, gridY: 3 }, "normal"),
			new PathTile({ gridX: 12, gridY: 3 }, "normal"),
			new PathTile({ gridX: 12, gridY: 4 }, "normal"),
		]);
	}
	static get defaultEnemy() {
		return new ArmyPath([new PathTile({ gridX: 12, gridY: 6 }, "normal")]);
	}
}
