// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../match-maker/board-serializer";
import { ArmyFactory } from "../../army/army-fixtures";
import { Faction } from "../../menu/main-menu";
import { ShopPhase } from "../shop";
import { OfferReservations } from "./offer-reservations";
import { Buyable } from "./buyable";

const SEED = 42;
const settle = () => new Promise((resolve) => setTimeout(resolve));

const openShop = async (round: number, reservations: OfferReservations, army = ArmyFactory.default(Faction.Elf)) => {
	const shop = new ShopPhase(
		army,
		async () => {},
		() => {},
		round,
		5,
		SEED,
		reservations,
	);
	await settle();
	return shop;
};

const offers = (shop: ShopPhase) => shop.retail.grid.getBuyables();
const slotOf = (offer: Buyable) => `${offer.cell.x},${offer.cell.y}`;
const offerAt = (shop: ShopPhase, slot: string) => offers(shop).find((offer) => slotOf(offer) === slot);
const gold = (shop: ShopPhase) => shop.army.getEconomyHooks().getEconomy().amount;

describe("offer reservations", () => {
	it("keeps a reserved offer in its slot when the player rerolls, and draws new offers in the other slots", async () => {
		const shop = await openShop(1, new OfferReservations());
		const [kept, ...others] = offers(shop);
		shop.toggleReservation(kept!);
		expect(shop.retail.isReserved(kept!)).toBe(true);

		shop.refresh();
		await settle();

		expect(offerAt(shop, slotOf(kept!))).toBe(kept);
		expect(offers(shop)).toHaveLength(shop.retail.slots.length);
		for (const other of others) expect(offers(shop)).not.toContain(other);
	});

	it("keeps the reroll's price, reserved offers or not", async () => {
		const shop = await openShop(1, new OfferReservations());
		shop.toggleReservation(offers(shop)[0]!);
		const before = gold(shop);
		shop.refresh();
		await settle();
		expect(gold(shop)).toBe(before - 5);
	});

	it("draws a new offer in a slot once its offer is unreserved", async () => {
		const shop = await openShop(1, new OfferReservations());
		const offer = offers(shop)[0]!;
		shop.toggleReservation(offer);
		shop.toggleReservation(offer);
		expect(shop.retail.isReserved(offer)).toBe(false);

		shop.refresh();
		await settle();
		expect(offers(shop)).not.toContain(offer);
	});

	it("keeps a reserved offer in its slot in the next round's shop", async () => {
		const reservations = new OfferReservations();
		const army = ArmyFactory.default(Faction.Elf);
		const first = await openShop(1, reservations, army);
		const [kept, ...others] = offers(first);
		first.toggleReservation(kept!);

		const next = await openShop(2, reservations, army);

		expect(offerAt(next, slotOf(kept!))).toBe(kept);
		expect(next.retail.isReserved(kept!)).toBe(true);
		expect(offers(next)).toHaveLength(next.retail.slots.length);
		for (const other of others) expect(offers(next)).not.toContain(other);
	});

	it("vacates the slot of a bought reserved offer and clears its reservation", async () => {
		const reservations = new OfferReservations();
		const shop = await openShop(1, reservations);
		const bought = offers(shop)[0]!;
		const slot = slotOf(bought);
		shop.toggleReservation(bought);

		shop.buy(bought);

		expect(offerAt(shop, slot)).toBeUndefined();
		expect(shop.retail.isReserved(bought)).toBe(false);
		expect(reservations.all()).toEqual([]);

		shop.refresh();
		await settle();
		expect(offerAt(shop, slot)).toBeDefined();
		expect(offerAt(shop, slot)).not.toBe(bought);
	});

	it("keeps the reservation of an offer picked up and put back", async () => {
		const shop = await openShop(1, new OfferReservations());
		const offer = offers(shop)[0]!;
		shop.toggleReservation(offer);

		shop.retail.removeItem(offer);
		expect(shop.retail.reservedOffers()).toEqual([]);
		shop.retail.addItem(offer);

		expect(shop.retail.reservedOffers()).toEqual([offer]);
	});
});
