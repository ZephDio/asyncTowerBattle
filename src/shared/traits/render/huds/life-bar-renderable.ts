import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../position";
import { LifeBar } from "../../../hud-element/entity-hud/lifebar";
import { THudRenderable } from "./hud-renderable";
import { HaveStats } from "../../../../engine/stats/stats";
import { TDrawable } from "../drawable";

export const TLifeBarRenderable = Subtrait([THudRenderable, HaveStats], (base) => {
	abstract class ILifeBarRenderable extends base {
		lifeBar = new LifeBar(this);
		override huds() {
			return [
				...super.huds(),
				{
					hud: this.lifeBar,
					position: new GridPosition({ x: 0, y: 2.5 }),
				},
			];
		}
	}
	return ILifeBarRenderable;
});
