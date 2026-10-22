import { implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { ArmyGrid } from "../grid/grid";
import { RoundGrowth } from "../grid/grid-sizes";
import { TEnvironmentElement } from "./environment";
import { Forest } from "./forest";
import { Rock } from "./rock";

const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export class EnvironmentGeneration {
	generateForRound(grid: ArmyGrid, growth: RoundGrowth) {
		this.generateTrees(grid, growth.trees);
		this.generateRocks(grid, growth.rocks);
	}

	// Trees of a same batch grow next to each other when they can. The first one lands on any free cell, so it may or
	// may not touch older trees.
	generateTrees(grid: ArmyGrid, amount: number) {
		const planted: Cell[] = [];
		for (let i = 0; i < amount; i++) {
			const free = this.freeCells(grid);
			const connected = free.filter((cell) =>
				cell.surrounding().some((around) => planted.some((p) => p.equals(around))),
			);
			const cell = pickRandom(connected.length > 0 ? connected : free);
			if (!cell) return;
			grid.setElement(new Forest(cell));
			planted.push(cell);
		}
	}

	// Rocks stay away from other rocks and trees when they can.
	generateRocks(grid: ArmyGrid, amount: number) {
		for (let i = 0; i < amount; i++) {
			const free = this.freeCells(grid);
			const isolated = free.filter((cell) => !cell.surrounding().some((around) => this.isEnvironment(grid, around)));
			const cell = pickRandom(isolated.length > 0 ? isolated : free);
			if (!cell) return;
			grid.setElement(new Rock(cell));
		}
	}

	private freeCells(grid: ArmyGrid) {
		const cells: Cell[] = [];
		for (let x = 0; x < grid.width; x++) {
			for (let y = 0; y < grid.height; y++) {
				const cell = new Cell({ x, y });
				if (!grid.getElement(cell)) cells.push(cell);
			}
		}
		return cells;
	}

	private isEnvironment(grid: ArmyGrid, cell: Cell) {
		const element = grid.getElement(cell);
		return element !== undefined && implementsTrait(element, TEnvironmentElement);
	}
}
