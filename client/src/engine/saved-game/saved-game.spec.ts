import { Cell } from "../../shared/position";
import "../match-maker/board-serializer";
// After the serializer: loaded first, these run into the engine's grid <-> render traits import cycle.
import { ArmyFactory } from "../army/army-fixtures";
import { LocalMatchMaker } from "../match-maker/local-match-maker";
import { Faction } from "../menu/main-menu";
import { SlowingTrap } from "../trap/recruit/implementation/slowing-trap";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { BasicBarrack } from "../constructs/barrack/recruit/implementation/basic-barrack";
import { Fox } from "../units/recruit/implementation/fox";
import { Dragon } from "../units/recruit/implementation/dragon";
import { FrostTower } from "../constructs/tower/recruit/implementation/frost-tower";
import { BlacksmithTower } from "../constructs/tower/recruit/implementation/blacksmith-tower";
import { Mine } from "../constructs/totem/recruit/implementation/mine";
import { restoreGame, serializeGame } from "./saved-game";
import { Buyable } from "../shop/retail/buyable";
import { OfferReservations } from "../shop/retail/offer-reservations";
import { ShopPhase } from "../shop/shop";

const origin = () => new Cell({ x: 0, y: 0 });

const armyWithReserve = () => {
	const army = ArmyFactory.default(Faction.Elf);
	const barrack = new BasicBarrack(origin());
	barrack.setUnit(new Fox(origin()));
	[
		new FrostTower(origin()),
		new Mine(origin()),
		barrack,
		new Dragon(origin()),
		new SlowingTrap(origin()),
		new BasicPathTile(origin()),
	].forEach((recruit) => army.pushToInventory(recruit));
	army.goldEconomy.golds.amount = 37;
	return army;
};

const throughJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe("saved game", () => {
	it("rebuilds the army, its reserve and its gold from the JSON it was saved as", () => {
		const army = armyWithReserve();
		const saved = throughJson(
			serializeGame({ phase: "shop", army, runSeed: 1234, round: 1, life: 4, performance: { wins: 2, losses: 1 } }),
		);

		const restored = restoreGame(saved);

		expect(restored).toMatchObject({
			faction: Faction.Elf,
			runSeed: 1234,
			round: 1,
			life: 4,
			phase: "shop",
			opponent: null,
		});
		expect(restored.performance).toEqual({ wins: 2, losses: 1 });
		expect(serializeGame({ ...restored, opponent: undefined })).toEqual(saved);
		expect(saved.inventory.map((item) => item.kind)).toEqual(["tower", "totem", "barrack", "unit", "trap", "path"]);
		expect(restored.army.goldEconomy.golds.amount).toBe(37);
	});

	it("keeps a piece that spans several cells once, where the reserve placed it", () => {
		const army = ArmyFactory.default(Faction.Elf);
		const tower = new BlacksmithTower(origin());
		army.pushToInventory(tower);
		army.pushToInventory(new Fox(origin()));
		const placed = tower.cell.clone();

		const saved = throughJson(
			serializeGame({ phase: "shop", army, runSeed: 1, round: 1, life: 5, performance: { wins: 0, losses: 0 } }),
		);
		const restored = restoreGame(saved);

		expect(tower.gridShape.getVectorialCells().length).toBeGreaterThan(1);
		expect(saved.inventory).toHaveLength(2);
		const restoredTower = restored.army.inventory.getRecruits().find((recruit) => recruit instanceof BlacksmithTower);
		expect(restoredTower?.cell).toEqual(placed);
		expect(restored.army.inventory.getRecruits()).toHaveLength(3);
	});

	it("keeps the opponent of a battle with its seed and its player", () => {
		const army = ArmyFactory.default(Faction.Dwarf);
		const opponent = { ...LocalMatchMaker.board(1), playerName: "Bob" };

		const saved = throughJson(
			serializeGame({
				phase: "battle",
				army,
				runSeed: 1234,
				round: 1,
				life: 5,
				performance: { wins: 0, losses: 0 },
				opponent,
			}),
		);
		const restored = restoreGame(saved);

		expect(restored.opponent?.playerName).toBe("Bob");
		expect(restored.opponent?.randomSeed).toBe(opponent.randomSeed);
		expect(restored.opponent?.army.path.length).toBe(opponent.army.path.length);
	});

	it("keeps the reserved offers, which the shop of the continued game keeps in their slots", async () => {
		const army = ArmyFactory.default(Faction.Elf);
		const reserved = [
			Buyable.from(new Mine(new Cell({ x: 1, y: 3 })), 15),
			Buyable.from(new Fox(new Cell({ x: 5, y: 1 })), 15),
		];
		const snapshot = { army, runSeed: 1234, round: 2, life: 5, performance: { wins: 1, losses: 0 } };
		const saved = throughJson(serializeGame({ ...snapshot, phase: "shop", reservedOffers: reserved }));

		const restored = restoreGame(saved);

		expect(saved.reservedOffers).toEqual([
			{ item: { kind: "totem", type: "mine", cell: { x: 1, y: 3 } }, price: 15 },
			{ item: { kind: "unit", type: "fox", cell: { x: 5, y: 1 } }, price: 15 },
		]);
		expect(serializeGame({ ...restored, opponent: undefined })).toEqual(saved);
		const shop = new ShopPhase(
			restored.army,
			async () => {},
			() => {},
			restored.round,
			restored.life,
			restored.runSeed,
			new OfferReservations(restored.reservedOffers),
		);
		await new Promise((resolve) => setTimeout(resolve));
		const offerAt = (x: number, y: number) =>
			shop.retail.grid.getBuyables().find((offer) => offer.cell.x === x && offer.cell.y === y);
		expect(offerAt(1, 3)?.entity).toBeInstanceOf(Mine);
		expect(offerAt(5, 1)?.entity).toBeInstanceOf(Fox);
		expect(shop.retail.reservedOffers()).toHaveLength(2);
		expect(offerAt(1, 3)?.price).toBe(15);
	});

	it("restores a game saved before reservations with none", () => {
		const saved = throughJson(
			serializeGame({
				phase: "shop",
				army: ArmyFactory.default(Faction.Elf),
				runSeed: 1,
				round: 1,
				life: 5,
				performance: { wins: 0, losses: 0 },
			}),
		);
		delete saved.reservedOffers;

		expect(restoreGame(saved).reservedOffers).toEqual([]);
	});
});
