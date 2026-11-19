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

	it("adds a percent of the max health with its flat bonuses", () => {
		const unit = stats(10);
		unit.addMaxHealth(2);

		unit.addMaxHealth(10, true);

		expect(unit.maxHealth).toBeCloseTo(13.2);
		expect(unit.health).toBeCloseTo(13.2);
	});
});

describe("Stats.addFlat", () => {
	const unit = (castleDamage: number) => new Stats(10, castleDamage, 0, 0, 0, 0, 0, 0, () => {});

	it("adds to the base value before the percent modifiers", () => {
		const animal = unit(2);

		animal.addFlat("castleDamage", 1);
		animal.basePercentStat.castleDamage += 10;

		expect(animal.castleDamage).toBeCloseTo(3.3);
	});

	it("is boosted by a percent modifier given before it too", () => {
		const animal = unit(2);
		animal.basePercentStat.castleDamage += 10;

		animal.addFlat("castleDamage", 1);

		expect(animal.castleDamage).toBeCloseTo(3.3);
	});

	it("keeps the base value apart, for the trend of the live stats", () => {
		const animal = unit(2);

		animal.addFlat("castleDamage", 1);

		expect(animal.base.castleDamage).toBe(2);
	});

	it("raises health by the boosted max health gained", () => {
		const elf = new Stats(10, 0, 0, 0, 0, 0, 0, 0, () => {});
		elf.addMaxHealth(10, true);

		elf.addFlat("maxHealth", 2);

		expect(elf.maxHealth).toBeCloseTo(13.2);
		expect(elf.health).toBeCloseTo(13.2);
	});

	it("leaves health alone for the other stats", () => {
		const elf = new Stats(10, 0, 0, 0, 0, 0, 0, 0, () => {});

		elf.addFlat("movementSpeed", 1);

		expect(elf.health).toBe(10);
	});
});
