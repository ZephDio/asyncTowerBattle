import { implementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { GRID_GROWTH_CYCLE } from "../grid/grid-sizes";
import { deserializeBoard, serializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";
// After the serializer: loaded first, these run into the engine's grid <-> render traits import cycle.
import { shopBlueprints } from "../shop/retail/retail-filler";
import { Unit } from "../units/recruit/unit";

const rounds = GRID_GROWTH_CYCLE.map((_, index) => index + 1);

const shopUnits = shopBlueprints()
	.map((blueprint) => new blueprint({}).toRecruit(new Cell({ x: 0, y: 0 })))
	.filter((recruit) => implementsTrait(recruit, Unit));

describe("board serializer", () => {
	it.each(rounds)("rebuilds the local round %i board from its serialized form", (round) => {
		const { army, randomSeed } = LocalMatchMaker.board(round);
		const board = serializeBoard(army, round, randomSeed);

		const opponent = deserializeBoard(JSON.parse(JSON.stringify(board)));

		expect(serializeBoard(opponent.army, round, opponent.randomSeed)).toEqual(board);
		expect(opponent.army.path.length).toBe(army.path.length);
		expect(opponent.army.defaultUnit.constructor).toBe(army.defaultUnit.constructor);
	});

	it("serializes and rebuilds the blacksmith tower under its own type", () => {
		const { army, randomSeed } = LocalMatchMaker.board(4);
		const board = serializeBoard(army, 4, randomSeed);
		const blacksmiths = board.elements.filter((element) => element.kind === "tower" && element.type === "blacksmith");

		const opponent = deserializeBoard(JSON.parse(JSON.stringify(board)));

		expect(blacksmiths).toHaveLength(1);
		expect(opponent.army.grid.getRecruits().map((recruit) => recruit.constructor.name)).toContain("BlacksmithTower");
	});

	it("knows every unit the shop sells", () => {
		expect(shopUnits.map((unit) => unit.constructor.name)).toEqual(expect.arrayContaining(["GoGoat", "ParadiseBird"]));
	});

	it.each(shopUnits.map((unit) => [unit.constructor.name, unit] as const))(
		"rebuilds a barrack holding a %s",
		(_name, unit) => {
			const { army, randomSeed } = LocalMatchMaker.board(1);
			const barrack = army.barracks[0];
			if (!barrack) throw new Error("The round 1 board has no barrack");
			barrack.setUnit(unit);
			const board = serializeBoard(army, 1, randomSeed);

			const opponent = deserializeBoard(JSON.parse(JSON.stringify(board)));

			expect(opponent.army.barracks.map((rebuilt) => rebuilt.unitRecruit?.constructor)).toContain(unit.constructor);
			expect(serializeBoard(opponent.army, 1, opponent.randomSeed)).toEqual(board);
		},
	);
});
