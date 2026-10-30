import { Cell } from "../../../position";
import { PatternEffect } from "../../../../engine/pattern-effect/pattern-effect";
import { BoardOrientation, flipCell, orientCell } from "./board-orientation";

// A battle grid fuses two 5×6 army grids.
const WIDTH = 5;
const HEIGHT = 12;
const flip = (cell: Cell) => flipCell(cell, WIDTH, HEIGHT);
const cell = (x: number, y: number) => new Cell({ x, y });

describe("board orientation", () => {
	it("keeps a cell as written when normal and negates it when mirrored", () => {
		expect(orientCell(cell(1, -2), BoardOrientation.Normal)).toEqual(cell(1, -2));
		expect(orientCell(cell(1, -2), BoardOrientation.Mirrored)).toEqual(cell(-1, 2));
		expect(orientCell(cell(0, 0), BoardOrientation.Mirrored)).toEqual(cell(0, 0));
	});

	it("flips a cell through the centre of the board", () => {
		expect(flipCell(cell(4, 11), WIDTH, HEIGHT)).toEqual(cell(0, 0));
		expect(flipCell(cell(1, 2), WIDTH, HEIGHT)).toEqual(cell(3, 9));
	});

	it("occupies the flipped cells with a mirrored 2-cell footprint", () => {
		const footprint = [cell(0, 0), cell(-1, 0)];
		const anchor = cell(2, 1);
		const allied = footprint.map((offset) => anchor.add(orientCell(offset, BoardOrientation.Normal)));
		const enemy = footprint.map((offset) => flip(anchor).add(orientCell(offset, BoardOrientation.Mirrored)));
		expect(enemy).toEqual(allied.map(flip));
	});

	it("targets the bottom-left neighbour with a mirrored top-right pattern cell", () => {
		const pattern = new PatternEffect([cell(1, 1)], () => true);
		const piece = cell(2, 2);
		const [alliedTarget] = pattern.getRelativeCells(BoardOrientation.Normal).map((offset) => piece.add(offset));
		const [enemyTarget] = pattern.getRelativeCells(BoardOrientation.Mirrored).map((offset) => flip(piece).add(offset));
		expect(alliedTarget).toEqual(cell(3, 3));
		expect(enemyTarget).toEqual(flip(piece).add(cell(-1, -1)));
		expect(enemyTarget).toEqual(flip(cell(3, 3)));
	});
});
