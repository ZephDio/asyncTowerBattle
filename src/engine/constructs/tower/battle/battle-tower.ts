import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TCasterHudRenderable } from "../../../../shared/traits/render/huds/caster-camembert-renderable";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { HaveStats } from "../../../stats/stats";
import { Tower } from "../recruit/tower";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { TStatsRenderable } from "../../../../shared/traits/render/huds/stat-renderable";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
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
		HTTag,
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

			casts(): void {
				this.castInProgress = new Cast(this, this.onCastResolve.bind(this));
			}
		}
		return BattleTower;
	},
);
