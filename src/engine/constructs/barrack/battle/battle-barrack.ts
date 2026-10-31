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
import { HTDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { AnyUnit } from "../../../units/recruit/unit";
import { TStatsRenderable } from "../../../../shared/traits/render/huds/stat-renderable";
import { castCostFromFrames } from "../../../../shared/seconds";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyBarrack } from "../recruit/barrack";
import { HTTag } from "../../../../shared/traits/engine/tags/tagged";
import { HTRarity } from "../../../../shared/traits/engine/rarity";

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
		HTDescriptor,
		HTTag,
		HTRarity,
	],
	(base) => {
		abstract class BattleBarrack extends base {
			abstract castCost: number;
			abstract onCastResolve(): void;
			abstract unitRecruit: AnyUnit | null;
			abstract hooks: BattleArmyHooks;
			abstract barrack: AnyBarrack;

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
				return this.barrack.castMultiplier;
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
