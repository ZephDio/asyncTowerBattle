// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../match-maker/board-serializer";
import { Cell, GridPosition } from "../../../../shared/position";
import { Rarity } from "../../../../shared/traits/engine/rarity";
import { secondsToFrame } from "../../../../shared/seconds";
import type { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Stunned } from "../../../stats/status/stunned";
import { StunTrap } from "../../recruit/implementation/stun-trap";
import { StunTrapBlueprint } from "../../blueprint/implementation/stun-trap-blueprint";

const stepper = () => {
	const stunned: Stunned[] = [];
	const unit = { addCondition: (condition: Stunned) => stunned.push(condition) };
	const hooks = { searchEnemyInArea: () => [unit] } as unknown as BattleArmyHooks;
	const trap = new StunTrap(new Cell({ x: 1, y: 1 })).toBattle(
		new Cell({ x: 1, y: 1 }),
		new GridPosition({ x: 1, y: 1 }),
		hooks,
	);
	return { trap, stunned };
};

describe("Stun Trap", () => {
	it("is a Rare that says what it does: 1 s stun, 4.5 s to re-arm", () => {
		const blueprint = new StunTrapBlueprint({});
		expect(blueprint.rarity).toBe(Rarity.Rare);
		expect(blueprint.description.description.join(" ")).toContain("1 second");
		expect(blueprint.description.description.join(" ")).toContain("4.5 seconds");
		expect(new Stunned({}).duration).toBe(secondsToFrame(1));
	});

	it("stuns the unit on it, then waits 4.5 s before it can stun again", () => {
		const { trap, stunned } = stepper();
		const ticksUntil = (count: number) => {
			while (stunned.length < count) trap.tick();
		};
		ticksUntil(1);
		expect(trap.cooldown).toBe(secondsToFrame(4.5));
		let disarmed = 0;
		while (stunned.length === 1) {
			trap.tick();
			disarmed++;
		}
		// The cooldown, then the same delay before the unit still standing on it is stunned again
		expect(disarmed).toBeGreaterThanOrEqual(secondsToFrame(4.5));
	});
});
