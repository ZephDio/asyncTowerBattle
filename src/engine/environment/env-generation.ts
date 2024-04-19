import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { Forest } from "./forest";
import { Rock } from "./rock";

export class EnvironmentGeneration {
	generateEnvironment(grid: ArmyGrid, rounds: number) {
		if (rounds === 0) {
			this.generateTrees(grid, 3);
			this.generateRocks(grid, 2);
		}
	}

	generateTrees(grid: ArmyGrid, amount: number) {
		let trys = 0;
		let generated = 0;
		let lastGenerated = null as null | Forest;
		while (generated < amount && trys < 10000) {
			if (!lastGenerated) {
				const x = Math.round(Math.random() * (grid.width - 1));
				const y = Math.round(Math.random() * (grid.height - 1));
				const cell = new Cell({ x, y });
				if (!grid.getElement(cell)) {
					const forest = new Forest(cell);
					grid.setElement(forest);
					lastGenerated = forest;
					generated++;
				}
			}
			if (lastGenerated && generated < amount) {
				const axe = Math.random() < 0.5 ? 0 : 1;
				let x = lastGenerated.cell.x;
				let y = lastGenerated.cell.y;
				if (axe) {
					x += Math.random() < 0.5 ? -1 : 1;
				} else {
					y += Math.random() < 0.5 ? -1 : 1;
				}
				if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
					trys++;
					continue;
				}
				const cell = new Cell({ x, y });
				if (!grid.getElement(cell)) {
					const forest = new Forest(cell);
					grid.setElement(forest);
					lastGenerated = forest;
					generated++;
				}
			}

			trys++;
		}
	}

	generateRocks(grid: ArmyGrid, amount: number) {
		let trys = 0;
		let generated = 0;

		while (generated < amount && trys < 10000) {
			const x = Math.round(Math.random() * (grid.width - 1));
			const y = Math.round(Math.random() * (grid.height - 1));
			const cell = new Cell({ x, y });

			const surrounding = cell.surrounding();
			if (surrounding.some((c) => grid.getElement(c))) {
				if (Math.random() > 0.1) {
					trys++;
					continue;
				}
			}
			if (!grid.getElement(cell)) {
				const forest = new Rock(cell);
				grid.setElement(forest);
				generated++;
			}

			trys++;
		}
	}
}
