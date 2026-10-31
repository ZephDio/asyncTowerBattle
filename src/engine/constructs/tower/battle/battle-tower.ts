import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TCasterHudRenderable } from "../../../../shared/traits/render/huds/caster-camembert-renderable";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { HaveStats } from "../../../stats/stats";
import { Tower } from "../recruit/tower";
import {
	HTDescriptor,
	LiveLine,
	TLiveDescriptor,
	TowerLinesDescription,
	formatStat,
	liveStat,
} from "../../../../shared/traits/render/huds/item-descriptor";
import { castSpeedToSecond } from "../../../../shared/seconds";
import { TStatsRenderable } from "../../../../shared/traits/render/huds/stat-renderable";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../../shared/traits/engine/rarity";
import { BoardOrientation } from "../../../../shared/traits/engine/core/board-orientation";

export type AnyBattleTower = ImplementsTrait<typeof BattleTower>;

export const BattleTower = Subtrait(
	[
		HTHitbox,
		TCasterHudRenderable,
		Caster,
		HTImageDrawable,
		TStatsRenderable,
		GridElement,
		HaveStats,
		HTDescriptor,
		TLiveDescriptor,
		HTTag,
		HTRarity,
	],
	(base, Props) => {
		abstract class BattleTower extends base {
			constructor(props: { orientation: BoardOrientation; recruit: ImplementsTrait<typeof Tower> } & typeof Props) {
				super(props);
				this.orientation = props.orientation;
				this.gridShape = props.recruit.gridShape;
			}

			abstract onCastResolve(): void;

			tick() {
				this.stats.tick();
				this.tickCast();
			}

			isAlive() {
				return true;
			}

			liveLines(): Record<keyof TowerLinesDescription, LiveLine> {
				const { stats } = this;
				const castTime = stats.castSpeed > 0 ? `${castSpeedToSecond(stats.castSpeed)}s` : "stopped";
				return {
					damage: liveStat(formatStat(stats.attack), stats.attack, stats.base.attack),
					"cast speed": liveStat(castTime, stats.castSpeed, stats.base.castSpeed),
					"food consumption": liveStat(formatStat(stats.foodCost), stats.foodCost, stats.base.foodCost, false),
					range: liveStat(formatStat(stats.range), stats.range, stats.base.range),
				};
			}

			casts(): void {
				this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
			}
		}
		return BattleTower;
	},
);
