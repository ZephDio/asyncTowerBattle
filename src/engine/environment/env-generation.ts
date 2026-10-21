import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { ARMY_GRID_SIZES } from "../grid/grid-sizes";
import { Forest } from "./forest";
import { Rock } from "./rock";
8 / 10
export class EnvironmentGeneration {
	generateEnvironmentForRoundOne(grid: ArmyGrid) {
			this.generateTrees(grid, 3);
			this.generateRocks(grid, 2);
	}
	

	generateEnvironmentForRoundTwo(grid: ArmyGrid){
			const { width, height } = ARMY_GRID_SIZES.round2;
			// new right column (door row excluded) or new top row
			if(Math.random() < (5/12)){
				this.generateRocks(grid, 1, {minX : width - 1, maxX : width - 1, minY : 1, maxY : height - 2});
				return
			}
			this.generateRocks(grid, 1, {minX : 0, maxX : width - 1, minY : 0, maxY : 0});
	}

	generateEnvironmentForRoundThree(grid: ArmyGrid){
			const minX = ARMY_GRID_SIZES.round2.width;
			const { width, height } = ARMY_GRID_SIZES.round3;
			this.generateTrees(grid, 2, {minX, maxX : width - 1, minY : 0, maxY : height - 1});
			this.generateRocks(grid, 1, {minX, maxX : width - 1, minY : 0, maxY : height - 1});
	}
	
	generateTrees(grid: ArmyGrid, amount: number, range? : {minX : number, maxX: number , minY : number, maxY : number}) {
		let trys = 0;
		let generated = 0;
		let lastGenerated = null as null | Forest;
		while (generated < amount && trys < 10000) {
			if (!lastGenerated) {
				let x : number
				let y : number
				if(range){
					x = Math.round(Math.random() * (range.maxX - range.minX) + range.minX);
					y = Math.round(Math.random() * (range.maxY - range.minY) + range.minY);
				}else{
					x = Math.round(Math.random() * (grid.width - 1 ));
					y = Math.round(Math.random() * (grid.height - 1));
				}
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

	generateRocks(grid: ArmyGrid, amount: number, range? : {minX : number, maxX: number , minY : number, maxY : number}) {
		let trys = 0;
		let generated = 0;

		while (generated < amount && trys < 10000) {
			let x : number
			let y : number
			if(range){
				x = Math.round(Math.random() * (range.maxX - range.minX) + range.minX);
				y = Math.round(Math.random() * (range.maxY - range.minY) + range.minY);
			} else {
				x = Math.round(Math.random() * (grid.width - 1));
				y = Math.round(Math.random() * (grid.height - 1));
			}
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
