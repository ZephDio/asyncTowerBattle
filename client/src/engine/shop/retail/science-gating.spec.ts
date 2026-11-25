// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../match-maker/board-serializer";
import { ArmyFactory } from "../../army/army-fixtures";
import { Faction } from "../../menu/main-menu";
import { CastleFactory } from "../../castle/recruit/castle-recruit-fixtures";
import { ForestCabinBlueprint } from "../../constructs/tower/blueprint/implementation/forest-cabin-blueprint";
import { Science } from "../../../shared/traits/engine/science";
import { Cell } from "../../../shared/position";
import { RetailFiller } from "./retail-filler";

const offeredCabin = (sciences: ReadonlySet<Science>) =>
	new RetailFiller(1, Math.random, sciences)
		.candidates()
		.some(({ blueprint }) => blueprint instanceof ForestCabinBlueprint);

describe("sciences", () => {
	it("keeps the Forest Cabin out of the shop until the army holds the Elf science", () => {
		expect(offeredCabin(new Set())).toBe(false);
		expect(offeredCabin(new Set([Science.Dwarf]))).toBe(false);
		expect(offeredCabin(new Set([Science.Elf]))).toBe(true);
	});

	it("never offers a gated piece without its science, whatever the roll", () => {
		const slots = Array.from({ length: 8 }, (_, index) => new Cell({ x: index, y: 0 }));
		for (let round = 1; round <= 16; round++) {
			const offers = new RetailFiller(round).getFreshItems(slots);
			expect(offers.some(({ recruit }) => recruit.constructor.name === "ForestCabin")).toBe(false);
		}
	});

	it("is granted by the castles: Elf by the Elf castle, Dwarf by the Dwarf castle", () => {
		expect([...CastleFactory.defaultElf.grantedSciences]).toEqual([Science.Elf]);
		expect([...CastleFactory.defaultDwarf.grantedSciences]).toEqual([Science.Dwarf]);
	});

	it("is derived from the army's castle", () => {
		expect([...ArmyFactory.default(Faction.Elf).sciences]).toEqual([Science.Elf]);
		expect([...ArmyFactory.default(Faction.Dwarf).sciences]).toEqual([Science.Dwarf]);
	});
});
