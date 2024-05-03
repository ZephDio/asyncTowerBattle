import { Subtrait } from "@ddd-ts/traits";
import { BasicBattleBarrack } from "./implementation/battle-basic-barrack";
import { VeterantBattleBarrack } from "./implementation/battle-veterant-barrack";
import { WaveBattleBarrack } from "./implementation/battle-wave-barrack";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { Cast, Caster } from "../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { TUnitPreviewHudRenderable } from "../../../shared/traits/render/huds/unit-preview-enderable";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { HaveStats } from "../../stats/stats";
import { Orientable } from "../../../shared/traits/engine/core/orientable";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";
import { AnyUnit } from "../../units/recruit/unit";

export type AnyBattleBarrack = BasicBattleBarrack | WaveBattleBarrack | VeterantBattleBarrack;

export const BattleBarrack = Subtrait(
	[
		TCollider,
		HTHitbox,
		Caster,
		HTImageDrawable,
		TUnitPreviewHudRenderable,
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

			tick() {
				super.tickCast();	
			}

			casts(): void {
				this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost);
			}
		}
		return BattleBarrack;
	},
);
