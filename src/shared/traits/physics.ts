import { Trait } from "@ddd-ts/traits";

export const TPhysics = Trait((base) => {
	abstract class IPhysics extends base {
		abstract tick(): void;
		abstract takeDamage(damage: number): void;
		abstract isAlive(): boolean;
	}

	return IPhysics;
});
