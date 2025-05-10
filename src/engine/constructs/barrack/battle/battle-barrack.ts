import { Subtrait } from "@ddd-ts/traits";
import { BasicBattleBarrack } from "./implementation/battle-basic-barrack";
import { VeterantBattleBarrack } from "./implementation/battle-veterant-barrack";
import { WaveBattleBarrack } from "./implementation/battle-wave-barrack";
import { TCollider } from "../../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TUnitPreviewHudRenderable } from "../../../../shared/traits/render/huds/unit-preview-enderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { HaveStats } from "../../../stats/stats";
import { Orientable } from "../../../../shared/traits/engine/core/orientable";
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { AnyUnit } from "../../../units/recruit/unit";
import { TStatsRenderable } from "../../../../shared/traits/render/huds/stat-renderable";
import { castCostFromFrames } from "../../../../shared/seconds";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBarrack } from "../recruit/barrack";

export type AnyBattleBarrack = BasicBattleBarrack | WaveBattleBarrack | VeterantBattleBarrack;

export const BattleBarrack = Subtrait(
	[
		TCollider,
		HTHitbox,
		Caster,
		HTImageDrawable,
		TUnitPreviewHudRenderable,
		TStatsRenderable,
		GridElement,
		HaveStats,
		Orientable,
		HTDescriptor,
	],
	(base) => {
		abstract class BattleBarrack extends base {
			abstract castCost: number;
			abstract onCastResolve(): void;
			abstract unitRecruit: AnyUnit | null;
			abstract hooks: BattleArmyHooks;
			abstract barrackRecruit: AnyBarrack;

			tick() {
				super.tickCast();
			}

			get bondedUnit() {
				return this.unitRecruit ?? this.hooks.getDefaultUnit();
			}

			override get castTime() {
				return castCostFromFrames(this.bondedUnit.stats.summonTime / 31.25 / this.castMultiplier);
			}

			get castMultiplier() {
				return this.barrackRecruit.castMultiplier;
			}

			casts(): void {
				this.castInProgress = new Cast(
					this,
					this.onCastResolve.bind(this),
					castCostFromFrames(this.bondedUnit.stats.summonTime),
				);
			}
		}
		return BattleBarrack;
	},
);
