import { Derive } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../../shared/position";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { LockedPathResource, PathResources } from "../../../renderer/resources/path.resources";

// Drawn over the path tile of a locked cell, one end of the path: a stone road coming from the enemy half or leading
// into the castle, fading into the dirt path along the tile's connection into the grid. The grid lists it after its
// elements and before the traps, so it covers the tile and a trap on the tile still shows.
export class LockedCellEffect extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.CarpetStyleGridElement;
	constructor(
		public cell: Cell,
		public connections: Cell[],
		public images: LockedPathResource,
	) {
		super({});
	}

	// Sized like the path tile it covers.
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		const { width, height } = PathResources.normal.size;
		const size = this.getCanvasSize(context, width, height, scale);
		this.drawImage(context, size, this.getCanvasPosition(context, position), this.image());
	}

	// A path end always connects up, out of the grid; the other connection picks the straight or the turn.
	image() {
		if (this.connects(-1)) return this.images.turnLeft;
		if (this.connects(1)) return this.images.turnRight;
		return this.images.straight;
	}

	connects(x: number) {
		return this.connections.some((offset) => offset.x === x && offset.y === 0);
	}

	get position() {
		return this.cell;
	}
}
