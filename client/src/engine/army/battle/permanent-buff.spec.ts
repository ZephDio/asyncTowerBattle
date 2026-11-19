import { Derive } from "@ddd-ts/traits";
import { Tagged, withTag, type Tag } from "../../../shared/traits/engine/tags/tagged";
import { Stats } from "../../stats/stats";
import { PermanentBuff } from "./permanent-buff";
import type { AnyBattleUnit } from "../../units/battle/battle-unit";

class FakeUnit extends Derive(Tagged) {
	stats: Stats;

	constructor(tags: Tag[], maxHealth = 10, castleDamage = 2) {
		super({});
		this.tags = tags;
		this.stats = new Stats(maxHealth, castleDamage, 0, 0, 0, 0, 0, 0, () => {});
	}
}

// An army with just what the buff reads: the units on the field and the ones joining.
const army = () => {
	const units: FakeUnit[] = [];
	const listeners: ((unit: AnyBattleUnit) => void)[] = [];
	const hooks = {
		getAlliedUnits: () => units as unknown as AnyBattleUnit[],
		onUnitAdded: (listener: (unit: AnyBattleUnit) => void) => listeners.push(listener),
	};
	const add = (unit: FakeUnit) => {
		units.push(unit);
		for (const listener of listeners) listener(unit as unknown as AnyBattleUnit);
		return unit;
	};
	return { hooks, add };
};

describe("PermanentBuff", () => {
	it("gives its amount to every matching unit that joins", () => {
		const { hooks, add } = army();
		new PermanentBuff(hooks, withTag("Animal"), "castleDamage", 1);

		const fox = add(new FakeUnit(["Animal"]));

		expect(fox.stats.castleDamage).toBeCloseTo(3);
	});

	it("leaves the units without the tag alone", () => {
		const { hooks, add } = army();
		new PermanentBuff(hooks, withTag("Animal"), "castleDamage", 1);

		const elf = add(new FakeUnit(["Kinfolk"]));

		expect(elf.stats.castleDamage).toBeCloseTo(2);
	});

	it("gives nothing while its amount is 0", () => {
		const { hooks, add } = army();
		new PermanentBuff(hooks, withTag("Kinfolk"), "maxHealth");

		const elf = add(new FakeUnit(["Kinfolk"]));

		expect(elf.stats.maxHealth).toBeCloseTo(10);
	});

	it("gives a raise to the matching units already there, once", () => {
		const { hooks, add } = army();
		const buff = new PermanentBuff(hooks, withTag("Kinfolk"), "maxHealth");
		const elf = add(new FakeUnit(["Kinfolk"]));

		buff.raise(1);
		buff.raise(1);

		expect(buff.amount).toBe(2);
		expect(elf.stats.maxHealth).toBeCloseTo(12);
		expect(elf.stats.health).toBeCloseTo(12);
	});

	it("gives the units joining after a raise the amount reached so far", () => {
		const { hooks, add } = army();
		const buff = new PermanentBuff(hooks, withTag("Kinfolk"), "maxHealth");
		buff.raise(3);

		const late = add(new FakeUnit(["Kinfolk"]));
		buff.raise(1);

		expect(late.stats.maxHealth).toBeCloseTo(14);
	});

	it("stacks with another buff on the same stat", () => {
		const { hooks, add } = army();
		new PermanentBuff(hooks, withTag("Animal"), "castleDamage", 1);
		new PermanentBuff(hooks, withTag("Animal"), "castleDamage", 1);

		const fox = add(new FakeUnit(["Animal"]));

		expect(fox.stats.castleDamage).toBeCloseTo(4);
	});
});
