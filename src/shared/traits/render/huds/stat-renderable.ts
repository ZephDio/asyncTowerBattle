import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { HaveStats } from "../../../../engine/stats/stats";
import { GridPosition } from "../../../position";
import { THudRenderable } from "./hud-renderable";
import { TDrawable } from "../drawable";

export const TStatsRenderable = Subtrait([THudRenderable, HaveStats], (base) => {
	abstract class IStatsRenderable extends base {
		override huds(): { hud: ImplementsTrait<typeof TDrawable>; position: GridPosition }[] {
			const renderableStatus = this.stats.getRenderableStatus();
			const status = renderableStatus.map((status) => ({ hud: status, position: new GridPosition({ x: 0, y: 0 }) }));
			return [...super.huds(), ...status];
		}
	}
	return IStatsRenderable;
});
