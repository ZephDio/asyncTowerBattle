import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { TCasterHudRenderable } from "../../../shared/traits/render/huds/caster-camembert-renderable";
import { Cast, Caster } from "../../../shared/traits/engine/cast";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { HaveStats } from "../../stats/stats";
import { Orientable } from "../../../shared/traits/engine/core/orientable";
import { Tower } from "../recruit/tower";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";

export type AnyBattleTower = ImplementsTrait<typeof BattleTower>;

export const BattleTower = Subtrait([
	HTHitbox,
	TCasterHudRenderable,
	Caster,
	HTImageDrawable,
	GridElement,
	HaveStats,
	Orientable,
	HTDescriptor], (base, Props) => {
		abstract class BattleTower extends base {

			constructor(props: { orientation : number , recruit : ImplementsTrait<typeof Tower>} & typeof Props){
				super(props)
				this.setOrientation(props.orientation);
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
			this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
		}
	}
	return BattleTower;

})