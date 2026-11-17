import { Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../position";
import { BattlePath } from "../../../engine/path/battle/battle-path";
import { BattleArmyHooks } from "../../../engine/army/battle/battle-army";
import { AnyBattleUnit } from "../../../engine/units/battle/battle-unit";
import { BaseStatsProps, TBaseStats } from "../../../engine/stats/base-stats";

export const TokenUnit = Subtrait([TBaseStats({} as BaseStatsProps)], (base) => {
	abstract class ITokenUnit extends base {
		abstract toBattle(gridPosition: GridPosition, enemyPath: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;
	}
	return ITokenUnit;
});
