import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
export const RecruitBattleStart = Trait((base) => {
	abstract class TBattleStartRecruit extends base {
		instantiateBattleStart = true;
	}
	return TBattleStartRecruit;
});

export const BattleStartTrigger = Subtrait([], (base, Props) => {
	abstract class TBattleStartTrigger extends base {
		constructor(props: { battleStartRecruit: ImplementsTrait<typeof RecruitBattleStart> } & typeof Props) {
			super(props);
		}
		abstract onBattleStart(): void;
	}
	return TBattleStartTrigger;
});
