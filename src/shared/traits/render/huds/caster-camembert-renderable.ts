import { Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../position";
import { Caster } from "../../engine/cast";
import { CasterCamembert } from "../../../hud-element/caster-camembert";
import { THudRenderable } from "./hud-renderable";

export const TCasterHudRenderable = Subtrait([THudRenderable, Caster], (base) => {
	abstract class ICasterRenderable extends base {
		casterCamembert = new CasterCamembert(this);
		override huds() {
			if (this.castInProgress) {
				return [
					...super.huds(),
					{
						hud: this.casterCamembert,
						position: new GridPosition({ x: 0, y: 2.5 }),
					},
				];
			}
			return [...super.huds()];
		}
	}
	return ICasterRenderable;
});
