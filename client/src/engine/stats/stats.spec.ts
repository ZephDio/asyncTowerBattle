import { Stats } from "./stats";

const stats = (maxHealth: number) => new Stats(maxHealth, 0, 0, 0, 0, 0, 0, 0, () => {});

describe("Stats.addMaxHealth", () => {
	it("adds a flat amount of max health, and the same health", () => {
		const unit = stats(10);

		unit.addMaxHealth(3);

		expect(unit.maxHealth).toBeCloseTo(13);
		expect(unit.health).toBeCloseTo(13);
	});

	it("adds the flat amounts up, whatever the base max health", () => {
		const unit = stats(40);

		unit.addMaxHealth(1);
		unit.addMaxHealth(2);

		expect(unit.maxHealth).toBeCloseTo(43);
	});

	it("adds a percent of the base max health", () => {
		const unit = stats(10);

		unit.addMaxHealth(50, true);

		expect(unit.maxHealth).toBeCloseTo(15);
		expect(unit.health).toBeCloseTo(15);
	});

	it("doesn't heal past what was lost", () => {
		const unit = stats(10);
		unit.takeDamage(4);

		unit.addMaxHealth(2);

		expect(unit.maxHealth).toBeCloseTo(12);
		expect(unit.health).toBeCloseTo(8);
	});
});
