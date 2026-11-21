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
		// The edge the path leaves the board by, as a unit offset: up for the door, left for the castle.
		public outward = new Cell({ x: 0, y: 1 }),
	) {
		super({});
	}

	// Sized like the path tile it covers.
	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.globalAlpha = 1;
		const { width, height } = PathResources.normal.size;
		const size = this.getCanvasSize(context, width, height, scale);
		this.drawImage(context, size, this.getCanvasPosition(context, position), this.image(), this.theta());
	}

	// The images are drawn with the outward arm up. Another edge turns them by the angle (counterclockwise) that takes
	// up to that edge: left is a quarter turn.
	theta() {
		const theta = Math.atan2(this.outward.y, this.outward.x) - Math.PI / 2;
		return theta === 0 ? undefined : theta;
	}

	// A path end always connects outward, out of the grid; the other connection picks the straight or the turn, read in
	// the images' frame where the outward arm is up.
	image() {
		const other = this.otherConnection();
		if (other.x === -1) return this.images.turnLeft;
		if (other.x === 1) return this.images.turnRight;
		return this.images.straight;
	}

	// The connection that is not the outward one, turned into the images' frame (outward = up).
	otherConnection() {
		const other = this.connections.find((offset) => !offset.equals(this.outward));
		if (!other) return new Cell({ x: 0, y: -1 });
		// Undo the quarter turns that took up to outward.
		const turns = Math.round((Math.atan2(this.outward.y, this.outward.x) - Math.PI / 2) / (Math.PI / 2));
		let { x, y } = other;
		for (let i = 0; i < ((turns % 4) + 4) % 4; i++) [x, y] = [y, -x];
		return new Cell({ x: x || 0, y: y || 0 });
	}

	get position() {
		return this.cell;
	}
}
