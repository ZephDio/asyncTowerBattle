import { Stats } from "../stats";
import { BoggedDown } from "./bogged-down";
import { Frozen } from "./frozen";
import { Hindered } from "./hindered";

// A base speed of 100
const stats = () => new Stats(10, 0, 0, 100, 0, 0, 0, 0, () => {});
const tick = (target: Stats, times: number) => {
	for (let i = 0; i < times; i++) target.tick();
};

describe("BoggedDown", () => {
	it("lasts 3 ticks by default and slows by 30%, as the mud trap relies on", () => {
		const target = stats();
		target.addCondition(new BoggedDown({}));

		tick(target, 1);
		expect(target.movementSpeed).toBeCloseTo(70);
		tick(target, 2);
		expect(target.movementSpeed).toBeCloseTo(100);
	});

	it("lasts for its duration prop", () => {
		const target = stats();
		target.addCondition(new BoggedDown({ duration: 64 }));

		tick(target, 63);
		expect(target.movementSpeed).toBeCloseTo(70);
		tick(target, 1);
		expect(target.movementSpeed).toBeCloseTo(100);
	});

	it("is not extended nor restarted by a short mud stacked on a long slow", () => {
		const target = stats();
		target.addCondition(new BoggedDown({ duration: 64 }));
		tick(target, 40);
		target.addCondition(new BoggedDown({}));

		tick(target, 23);
		expect(target.movementSpeed).toBeCloseTo(70);
		tick(target, 1);
		expect(target.movementSpeed).toBeCloseTo(100);
	});

	it("is refreshed by a longer application and never slows more than once per source", () => {
		const target = stats();
		target.addCondition(new BoggedDown({ duration: 64 }));
		tick(target, 40);
		target.addCondition(new BoggedDown({ duration: 64 }));
		tick(target, 1);

		expect(target.movementSpeed).toBeCloseTo(70);
		tick(target, 62);
		expect(target.movementSpeed).toBeCloseTo(70);
		tick(target, 1);
		expect(target.movementSpeed).toBeCloseTo(100);
	});

	it("keeps the strongest percent of one source", () => {
		const target = stats();
		target.addCondition(new Hindered({ duration: 64, percent: 30 }));
		tick(target, 1);
		target.addCondition(new Hindered({ duration: 64, percent: 50 }));
		expect(target.movementSpeed).toBeCloseTo(50);
		target.addCondition(new Hindered({ duration: 64, percent: 30 }));
		expect(target.movementSpeed).toBeCloseTo(50);
		tick(target, 64);
		expect(target.movementSpeed).toBeCloseTo(100);
	});

	it("keeps reductions to the same source from reaching below zero and a reduction from healing max health", () => {
		const target = stats();
		target.setModifier("movementSpeed", "a", -100);
		expect(target.movementSpeed).toBe(0);
		const health = target.maxHealth;
		target.setModifier("movementSpeed", "b", 50);
		expect(target.maxHealth).toBe(health);
	});

	it("adds buffs together and multiplies each slow: 100 +56% -30% -50% is 54.6", () => {
		const target = stats();
		target.basePercentStat.movementSpeed += 56;

		target.addCondition(new BoggedDown({ duration: 64 }));
		target.addCondition(new Hindered({ duration: 64, percent: 50 }));
		tick(target, 1);

		expect(target.movementSpeed).toBeCloseTo(156 * 0.7 * 0.5);
		expect(target.movementSpeed).toBeCloseTo(54.6);
		tick(target, 64);
		expect(target.movementSpeed).toBeCloseTo(156);
	});

	it("fades a Frozen slow out and multiplies it with the others", () => {
		const target = stats();
		target.addCondition(new Frozen(10, 50));
		target.addCondition(new BoggedDown({ duration: 64 }));
		tick(target, 1);
		expect(target.movementSpeed).toBeCloseTo(100 * 0.7 * (1 - 0.5 * 0.9));
		tick(target, 4);
		expect(target.movementSpeed).toBeCloseTo(100 * 0.7 * (1 - 0.5 * 0.5));
		tick(target, 5);
		expect(target.movementSpeed).toBeCloseTo(70);
	});
});
