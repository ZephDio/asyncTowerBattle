import { ArmyBuff } from "./army-buff";
import { BattleArmy } from "./battle-army";
import type { AnyBattleUnit } from "../../units/battle/battle-unit";

const unit = () => ({ initArmyBuffs: () => {}, addFurry: () => {}, applyBuff: () => {} }) as unknown as AnyBattleUnit;

const noop = (() => undefined) as never;

const army = () => {
	const armyBuff = new ArmyBuff();
	const battleArmy = new BattleArmy(
		{ getHooks: () => ({}) } as never,
		noop,
		noop,
		noop,
		noop,
		() => 0,
		() => ({ clock: 0 }),
		noop,
		noop,
		noop,
		undefined as never,
		undefined as never,
		armyBuff.getHooks(),
		armyBuff.getHooks(),
		undefined as never,
		undefined as never,
	);
	battleArmy.armyBuff = armyBuff;
	return battleArmy;
};

describe("BattleArmy unit added listeners", () => {
	it("tells every listener about each unit that joins, once", () => {
		const battleArmy = army();
		const first: AnyBattleUnit[] = [];
		const second: AnyBattleUnit[] = [];
		battleArmy.onUnitAdded((added) => first.push(added));
		battleArmy.onUnitAdded((added) => second.push(added));
		const joining = unit();

		battleArmy.addUnit(joining, undefined);

		expect(first).toEqual([joining]);
		expect(second).toEqual([joining]);
	});

	it("only tells about the units that join after the listener", () => {
		const battleArmy = army();
		const early = unit();
		battleArmy.addUnit(early, undefined);
		const added: AnyBattleUnit[] = [];

		battleArmy.onUnitAdded((joining) => added.push(joining));
		const late = unit();
		battleArmy.addUnit(late, undefined);

		expect(added).toEqual([late]);
	});

	it("has the unit in the army when the listener is told", () => {
		const battleArmy = army();
		let inArmy = false;
		battleArmy.onUnitAdded((joining) => {
			inArmy = battleArmy.units.has(joining);
		});

		battleArmy.addUnit(unit(), undefined);

		expect(inArmy).toBe(true);
	});

	it("exposes the listener registration in the army hooks", () => {
		const battleArmy = army();
		const added: AnyBattleUnit[] = [];
		battleArmy.getHooks().onUnitAdded((joining) => added.push(joining));
		const joining = unit();

		battleArmy.addUnit(joining, undefined);

		expect(added).toEqual([joining]);
	});
});
