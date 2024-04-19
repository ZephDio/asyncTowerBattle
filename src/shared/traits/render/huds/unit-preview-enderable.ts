import { Subtrait } from "@ddd-ts/traits";
import { GridPosition } from "../../../position";
import { UnitPreviewHud } from "../../../hud-element/entity-hud/unit-preview";
import { THudRenderable } from "./hud-renderable";

export const TUnitPreviewHudRenderable = Subtrait([THudRenderable], (base) => {
	abstract class IUnitPreviewHudRenderable extends base {
		unitPreview = new UnitPreviewHud(this as any);
		override huds() {
			return [
				...super.huds(),
				{
					hud: this.unitPreview,
					position: new GridPosition({ x: 0, y: 1.8 }),
				},
			];
		}
	}
	return IUnitPreviewHudRenderable;
});
