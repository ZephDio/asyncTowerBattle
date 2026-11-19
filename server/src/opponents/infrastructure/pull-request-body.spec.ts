import { BadRequestException } from "@nestjs/common";
import { parsePullRequestBody } from "./pull-request-body.js";

const board = {
	round: 2,
	faction: "Elf",
	size: { width: 9, height: 7 },
	randomSeed: 7,
	elements: [
		{ kind: "castle", cell: { x: 0, y: 6 } },
		{ kind: "totem", type: "bosquet", cell: { x: 3, y: 2 } },
		{ kind: "barrack", type: "basic", cell: { x: 1, y: 1 }, unit: null },
		{ kind: "path", cell: { x: 0, y: 5 }, trap: null, connectionChoice: [{ x: 0, y: 1 }] },
	],
};
const performance = { wins: 0, losses: 1 };

describe("parsePullRequestBody", () => {
	it("passes a well-shaped body through, piece types it doesn't know included", () => {
		expect(parsePullRequestBody({ board, performance })).toEqual({ board, performance });
	});

	it("leaves the rules to the domain: a well-shaped board can still be of the wrong size", () => {
		const wrongSize = { ...board, size: { width: 1, height: 1 } };

		expect(parsePullRequestBody({ board: wrongSize, performance }).board).toBe(wrongSize);
	});

	it.each([
		["no body", undefined],
		["no board", { performance }],
		["no performance", { board }],
		["a string seed", { board: { ...board, randomSeed: "seed" }, performance }],
		["an unknown faction", { board: { ...board, faction: "Orc" }, performance }],
		["no size", { board: { ...board, size: undefined }, performance }],
		["elements that aren't a list", { board: { ...board, elements: {} }, performance }],
		["an unknown kind", { board: { ...board, elements: [{ kind: "dragon", cell: { x: 0, y: 0 } }] }, performance }],
		["a cell without y", { board: { ...board, elements: [{ kind: "castle", cell: { x: 0 } }] }, performance }],
		["a tower without type", { board: { ...board, elements: [{ kind: "tower", cell: { x: 0, y: 0 } }] }, performance }],
		["wins as text", { board, performance: { wins: "1", losses: 0 } }],
	])("refuses %s", (_, body) => {
		expect(() => parsePullRequestBody(body)).toThrow(BadRequestException);
	});
});
