import { GRID_GROWTH_CYCLE } from "../grid/grid-sizes";
import { deserializeBoard, serializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";

const rounds = GRID_GROWTH_CYCLE.map((_, index) => index + 1);

describe("board serializer", () => {
	it.each(rounds)("rebuilds the local round %i board from its serialized form", (round) => {
		const { army, randomSeed } = LocalMatchMaker.board(round);
		const board = serializeBoard(army, round, randomSeed);

		const opponent = deserializeBoard(JSON.parse(JSON.stringify(board)));

		expect(serializeBoard(opponent.army, round, opponent.randomSeed)).toEqual(board);
		expect(opponent.army.path.length).toBe(army.path.length);
		expect(opponent.army.defaultUnit.constructor).toBe(army.defaultUnit.constructor);
	});
});
