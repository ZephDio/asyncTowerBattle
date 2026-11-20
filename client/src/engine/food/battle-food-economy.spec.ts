import { BattleFoodEconomy, FAMINE_DURATION } from "./battle-food-economy";

const setup = (food: number) => {
	const timer = { clock: 0 };
	const economy = new BattleFoodEconomy(100, () => timer);
	economy.food = food;
	return { economy, hooks: economy.getHooks(), timer };
};

describe("BattleFoodEconomy's famine alert", () => {
	it("lets consumers eat while there is enough food", () => {
		const { economy, hooks } = setup(10);

		expect(hooks.consumeFood(4)).toBe(true);
		expect(hooks.consumeFood(6)).toBe(true);
		expect(economy.getFood()).toBeCloseTo(0);
		expect(economy.isFamine()).toBe(false);
	});

	it("starts when a consumer can't pay, and that consumer eats nothing", () => {
		const { economy, hooks } = setup(3);

		expect(hooks.consumeFood(4)).toBe(false);
		expect(economy.getFood()).toBeCloseTo(3);
		expect(economy.isFamine()).toBe(true);
	});

	it("makes every other consumer fail without eating, even ones that could pay", () => {
		const { economy, hooks, timer } = setup(3);
		hooks.consumeFood(4);

		timer.clock = FAMINE_DURATION - 1;
		hooks.addFood(50);

		expect(hooks.consumeFood(1)).toBe(false);
		expect(economy.getFood()).toBeCloseTo(53);
	});

	it("lasts 3 seconds, then consumers eat again", () => {
		const { economy, hooks, timer } = setup(3);
		timer.clock = 10;
		hooks.consumeFood(4);

		timer.clock = 10 + FAMINE_DURATION;

		expect(FAMINE_DURATION).toBe(96);
		expect(economy.isFamine()).toBe(false);
		expect(hooks.consumeFood(2)).toBe(true);
		expect(economy.getFood()).toBeCloseTo(1);
	});

	it("does not stretch while it lasts: failed calls during the famine don't restart it", () => {
		const { economy, hooks, timer } = setup(0);
		hooks.consumeFood(1);

		timer.clock = FAMINE_DURATION - 1;
		hooks.consumeFood(1);
		timer.clock = FAMINE_DURATION;

		expect(economy.isFamine()).toBe(false);
	});

	it("starts again when a consumer can't pay after it ended", () => {
		const { economy, hooks, timer } = setup(0);
		hooks.consumeFood(1);
		timer.clock = FAMINE_DURATION;

		expect(hooks.consumeFood(1)).toBe(false);
		expect(economy.isFamine()).toBe(true);
	});

	it("keeps production and theft working during the famine", () => {
		const { economy, hooks } = setup(3);
		hooks.consumeFood(4);

		hooks.addFood(10);
		hooks.removeFood(5);

		expect(economy.getFood()).toBeCloseTo(8);
	});
});
