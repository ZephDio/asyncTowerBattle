import { Army } from "../army/army";
import { EnvironmentGeneration } from "../environment/env-generation";
import { roundGrowth } from "../grid/grid-sizes";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { Cell } from "../../shared/position";
import { runRandom } from "../../shared/run-random";

// Basic path tiles added to the reserve each time the grid grows.
const GRID_GROWTH_PATH_TILES = 2;

export class RoundsTracker {
	constructor(
		public alliedArmy: Army,
		public envGenerator: EnvironmentGeneration,
		public runSeed: number,
	) {}

	rounds = 0;

	update() {
		this.rounds++;
		const growth = roundGrowth(this.rounds);
		const grid = this.alliedArmy.grid;
		if (growth.size.width !== grid.width || growth.size.height !== grid.height) {
			grid.grow(growth.size);
			this.giveGridGrowthPathTiles();
		}
		this.envGenerator.generateForRound(grid, growth, runRandom(this.runSeed, "environment", this.rounds));
	}

	giveGridGrowthPathTiles() {
		for (let i = 0; i < GRID_GROWTH_PATH_TILES; i++) {
			const tile = new BasicPathTile(new Cell({ x: 0, y: 0 }));
			// a full reserve keeps what it has rather than failing the round change
			if (!this.alliedArmy.inventory.hasRoomFor(tile)) return;
			this.alliedArmy.pushToInventory(tile);
		}
	}

	get round() {
		return this.rounds;
	}
}
