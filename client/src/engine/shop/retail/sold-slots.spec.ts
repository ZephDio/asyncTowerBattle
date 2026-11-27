// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../match-maker/board-serializer";
import { ArmyFactory } from "../../army/army-fixtures";
import { Faction } from "../../menu/main-menu";
import { ShopPhase } from "../shop";
import { OfferReservations } from "./offer-reservations";
import { ScreenPosition } from "../../../shared/position";

const settle = () => new Promise((resolve) => setTimeout(resolve));

const openShop = async () => {
	const shop = new ShopPhase(
		ArmyFactory.default(Faction.Elf),
		async () => {},
		() => {},
		1,
		5,
		42,
		new OfferReservations(),
	);
	await settle();
	return shop;
};

const retailDrawables = (shop: ShopPhase) => shop.getDrawables().grids[2]!.drawables.map((d) => d.constructor.name);

describe("shop slot signs", () => {
	it("keeps the price and reserved signs of an offer while the player holds it", async () => {
		const shop = await openShop();
		const offer = shop.retail.grid.getBuyables()[0]!;
		shop.toggleReservation(offer);
		expect(retailDrawables(shop)).toEqual(["ReservedSignHud"]);

		shop.selectItemFromRetail(offer, new ScreenPosition({ x: 0, y: 0 }));
		expect(shop.retail.grid.getBuyables()).not.toContain(offer);
		expect(retailDrawables(shop)).toEqual(["ReservedSignHud", "OfferSlotSignHud"]);

		shop.holderControl.hold!.onRelease();
		expect(retailDrawables(shop)).toEqual(["ReservedSignHud"]);
	});

	it("replaces the price with a sold sign once bought, and drops the reserved sign", async () => {
		const shop = await openShop();
		const offer = shop.retail.grid.getBuyables()[0]!;
		shop.toggleReservation(offer);
		shop.selectItemFromRetail(offer, new ScreenPosition({ x: 0, y: 0 }));
		shop.buy(offer);
		expect(retailDrawables(shop)).toEqual(["OfferSlotSignHud"]);
	});

	it("clears the sold signs on a reroll", async () => {
		const shop = await openShop();
		shop.buy(shop.retail.grid.getBuyables()[0]!);
		shop.refresh();
		await settle();
		expect(retailDrawables(shop)).toEqual([]);
	});

	it("does not reroll while the player holds an offer", async () => {
		const shop = await openShop();
		const offers = shop.retail.grid.getBuyables();
		const held = offers[0]!;
		shop.selectItemFromRetail(held, new ScreenPosition({ x: 0, y: 0 }));
		const gold = shop.army.getEconomyHooks().getEconomy().amount;

		shop.refresh();
		await settle();

		expect(shop.army.getEconomyHooks().getEconomy().amount).toBe(gold);
		expect(shop.bellPressedAt).toBeNull();
		expect(shop.retail.grid.getBuyables()).toEqual(offers.slice(1));
		expect(shop.retail.held).toBe(held);

		shop.holderControl.hold!.onRelease();
		shop.refresh();
		await settle();
		expect(shop.army.getEconomyHooks().getEconomy().amount).toBe(gold - 5);
	});
});
