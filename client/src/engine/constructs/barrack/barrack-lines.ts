import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { frameToSeconds } from "../../../shared/seconds";
import { TDescriptor, formatStat, liveStat } from "../../../shared/traits/render/huds/item-descriptor";
import { TBaseStats } from "../../stats/base-stats";

// The barrack's descriptor lines: the unit it summons and the time between two summons, which is the unit's summon
// time over the barrack's production speed. Shown in the shop as well as during the battle.
export const barrackLines = (
	unit: ImplementsTrait<ReturnType<typeof TBaseStats>> | null,
	castSpeed: number,
	baseCastSpeed: number,
) => {
	const summonTime =
		unit && castSpeed > 0 ? `${frameToSeconds(unit.stats.summonTime / castSpeed).toFixed(1)}s` : unit ? "stopped" : "-";
	return {
		unit: unit && implementsTrait(unit, TDescriptor) ? unit.description.name : "-",
		"production speed": liveStat(`x${formatStat(castSpeed)}`, castSpeed, baseCastSpeed),
		"summon time": liveStat(summonTime, castSpeed, baseCastSpeed),
	};
};
