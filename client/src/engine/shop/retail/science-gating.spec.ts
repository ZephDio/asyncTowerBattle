// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../match-maker/board-serializer";
import { ArmyFactory } from "../../army/army-fixtures";
import { Faction } from "../../menu/main-menu";
import { CastleFactory } from "../../castle/recruit/castle-recruit-fixtures";
import { ForestCabinBlueprint } from "../../constructs/tower/blueprint/implementation/forest-cabin-blueprint";
import { BosquetBlueprint } from "../../constructs/totem/blueprint/implementation/bosquet-blueprint";
import { CauldronBlueprint } from "../../constructs/totem/blueprint/implementation/cauldron-blueprint";
import { ButcheryBlueprint } from "../../constructs/totem/blueprint/implementation/butchery-blueprint";
import { StonemasonBlueprint } from "../../constructs/totem/blueprint/implementation/stonemason-blueprint";
import { Science } from "../../../shared/traits/engine/science";
import { Cell } from "../../../shared/position";
import { WitchHouse } from "../../constructs/tower/recruit/implementation/witch-house";
import { HuntersAcademy } from "../../constructs/barrack/recruit/implementation/hunters-academy";
import { SlowingTrapBlueprint } from "../../trap/blueprint/implementation/slowing-trap-blueprint";
import { StunTrapBlueprint } from "../../trap/blueprint/implementation/stun-trap-blueprint";
import { RetailFiller } from "./retail-filler";

const offeredCabin = (sciences: ReadonlySet<Science>) =>
	new RetailFiller(1, Math.random, sciences)
		.candidates()
		.some(({ blueprint }) => blueprint instanceof ForestCabinBlueprint);

const offeredBosquet = (sciences: ReadonlySet<Science>) =>
	new RetailFiller(1, Math.random, sciences)
		.candidates()
		.some(({ blueprint }) => blueprint instanceof BosquetBlueprint);

describe("sciences", () => {
	it("offers the Forest Cabin to every army", () => {
		expect(offeredCabin(new Set())).toBe(true);
		expect(offeredCabin(new Set([Science.Dwarf]))).toBe(true);
		expect(offeredCabin(new Set([Science.Elf]))).toBe(true);
	});

	it("keeps the Bosquet out of the shop until the army holds the Elf science", () => {
		expect(offeredBosquet(new Set())).toBe(false);
		expect(offeredBosquet(new Set([Science.Dwarf]))).toBe(false);
		expect(offeredBosquet(new Set([Science.Elf]))).toBe(true);
	});

	it("keeps the Stonemason out of the shop until the army holds the Dwarf science", () => {
		const offered = (sciences: ReadonlySet<Science>) =>
			new RetailFiller(1, Math.random, sciences)
				.candidates()
				.some(({ blueprint }) => blueprint instanceof StonemasonBlueprint);
		expect(offered(new Set())).toBe(false);
		expect(offered(new Set([Science.Elf]))).toBe(false);
		expect(offered(new Set([Science.Dwarf]))).toBe(true);
	});

	it("keeps the Butchery out of the shop until the army holds the Dwarf science", () => {
		const offered = (sciences: ReadonlySet<Science>) =>
			new RetailFiller(1, Math.random, sciences)
				.candidates()
				.some(({ blueprint }) => blueprint instanceof ButcheryBlueprint);
		expect(offered(new Set())).toBe(false);
		expect(offered(new Set([Science.Elf]))).toBe(false);
		expect(offered(new Set([Science.Dwarf]))).toBe(true);
	});

	it("keeps the Cauldron out of the shop until the army holds the Witchcraft science", () => {
		const offered = (sciences: ReadonlySet<Science>) =>
			new RetailFiller(1, Math.random, sciences)
				.candidates()
				.some(({ blueprint }) => blueprint instanceof CauldronBlueprint);
		expect(offered(new Set())).toBe(false);
		expect(offered(new Set([Science.Dwarf]))).toBe(false);
		expect(offered(new Set([Science.Witchcraft]))).toBe(true);
	});

	it("keeps both traps out of the shop until the army holds the Trap science", () => {
		const offered = (sciences: ReadonlySet<Science>, trap: typeof SlowingTrapBlueprint | typeof StunTrapBlueprint) =>
			new RetailFiller(1, Math.random, sciences).candidates().some(({ blueprint }) => blueprint instanceof trap);
		for (const trap of [SlowingTrapBlueprint, StunTrapBlueprint]) {
			expect(offered(new Set(), trap)).toBe(false);
			expect(offered(new Set([Science.Elf, Science.Dwarf]), trap)).toBe(false);
			expect(offered(new Set([Science.Trap]), trap)).toBe(true);
		}
	});

	it("is granted by the Hunter's Academy while it stands on the grid, not in the reserve", () => {
		const army = ArmyFactory.default(Faction.Elf);
		const academy = new HuntersAcademy(new Cell({ x: 3, y: 2 }));
		army.inventory.add(academy);
		expect(army.sciences.has(Science.Trap)).toBe(false);

		army.inventory.deleteElement(academy);
		army.grid.setElement(academy);
		expect([...army.sciences].sort()).toEqual([Science.Elf, Science.Trap]);

		army.grid.deleteElement(academy);
		expect([...army.sciences]).toEqual([Science.Elf]);
	});

	it("never offers a gated piece without its science, whatever the roll", () => {
		const slots = Array.from({ length: 8 }, (_, index) => new Cell({ x: index, y: 0 }));
		for (let round = 1; round <= 16; round++) {
			const offers = new RetailFiller(round).getFreshItems(slots);
			expect(offers.some(({ recruit }) => recruit.constructor.name === "Bosquet")).toBe(false);
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

	it("is granted by the Witch House while it stands on the grid, not in the reserve", () => {
		expect([...new WitchHouse(new Cell({ x: 0, y: 0 })).grantedSciences]).toEqual([Science.Witchcraft]);

		const army = ArmyFactory.default(Faction.Elf);
		const house = new WitchHouse(new Cell({ x: 3, y: 2 }));
		army.inventory.add(house);
		expect(army.sciences.has(Science.Witchcraft)).toBe(false);

		army.inventory.deleteElement(house);
		army.grid.setElement(house);
		expect([...army.sciences].sort()).toEqual([Science.Elf, Science.Witchcraft]);

		army.grid.deleteElement(house);
		expect([...army.sciences]).toEqual([Science.Elf]);
	});
});
