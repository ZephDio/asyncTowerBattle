import { Subtrait } from "@ddd-ts/traits";
import { TGrid } from "../../../engine/grid/tgrid";
import { TDrawable } from "./drawable";
import { DrawPriority } from "./image-drawable";
import { EnvironmentResources } from "../../../renderer/resources/environment.resources";
import { layoutGrass } from "../../../engine/grid/grass-layout";
import { GrassSeed } from "../../../engine/grid/grass-seed";

// Every grass image, listed once: checking them is done every frame.
const GRASS_IMAGES = Object.values(EnvironmentResources.grass).flat();

export const TGridDrawable = Subtrait([TGrid, TDrawable], (base) => {
	abstract class IGridDrawable extends base {
		drawPriority = DrawPriority.BackGroundGrid;
		draw(context: CanvasRenderingContext2D): void {
			context.fillStyle = "#6C6";
			context.globalAlpha = 1;
			const position = this.getCanvasPosition(context, this.position);
			const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
			context.fillRect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
			this.drawGrass(context, position, tileSize);

			context.beginPath();
			context.lineWidth = 3;
			context.strokeStyle = "rgba(0,0,0,0.1)";
			for (const ci of new Array(this.width + 1).keys()) {
				this.drawLine(
					context,
					position.x + ci * tileSize,
					position.y,
					position.x + ci * tileSize,
					position.y - this.height * tileSize,
				);
			}
			for (const ri of new Array(this.height + 1).keys()) {
				this.drawLine(
					context,
					position.x,
					position.y - ri * tileSize,
					position.x + this.width * tileSize,
					position.y - ri * tileSize,
				);
			}
			context.stroke();
		}

		// The grass patches, laid out by the run's seed over the flat green, and clipped to the grid.
		drawGrass(context: CanvasRenderingContext2D, position: { x: number; y: number }, tileSize: number) {
			const patches = EnvironmentResources.grass;
			if (!GRASS_IMAGES.every((image) => image.complete && image.naturalWidth > 0)) return;
			context.save();
			context.beginPath();
			context.rect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
			context.clip();
			context.imageSmoothingEnabled = false;
			for (const patch of layoutGrass(GrassSeed.value, this.width, this.height)) {
				const width = patch.columns * tileSize;
				const height = patch.rows * tileSize;
				const centerX = position.x + (patch.column + patch.columns / 2) * tileSize;
				const centerY = position.y - (patch.row + patch.rows / 2) * tileSize;
				context.save();
				context.translate(centerX, centerY);
				context.scale(patch.flipX ? -1 : 1, 1);
				context.drawImage(patches[patch.kind][patch.variant]!, -width / 2, -height / 2, width, height);
				context.restore();
			}
			context.restore();
		}
	}
	return IGridDrawable;
});
