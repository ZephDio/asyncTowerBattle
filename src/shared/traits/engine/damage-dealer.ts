import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";

export const TDamageDealer = (baseDamage: number) =>
	Trait((base) => {
		return class IDamageDealer extends base {
			attackDamage = baseDamage;
		};
	});

export const HTDamageDealer = Subtrait([TDamageDealer(0)], (base, Param) => {
	return class IDamageDealer extends base {
		declare attackDamage: number;
		constructor(props: { damageDealer: ImplementsTrait<ReturnType<typeof TDamageDealer>> } & typeof Param) {
			super(props);
			this.attackDamage = props.damageDealer.attackDamage;
		}
	};
});
