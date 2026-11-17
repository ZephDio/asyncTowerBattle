import { Subtrait, Trait } from "@ddd-ts/traits";
import { Cell } from "../../shared/position";
import { TImageVariant } from "../../shared/traits/render/image-variant";
import { PathResource } from "../../renderer/resources/path.resources";

// Vertical straight, for a tile with no neighbors.
export const DEFAULT_PATH_CONNECTIONS = [new Cell({ x: 0, y: 1 }), new Cell({ x: 0, y: -1 })];

// The two directions (unit offsets) this tile connects, set from its neighbors by PathNetwork.
export const TPathConnections = Trait((base) => {
	abstract class IPathConnections extends base {
		pathConnections: Cell[] = DEFAULT_PATH_CONNECTIONS;
	}
	return IPathConnections;
});

// Draws the straight or turn image matching the tile's connections.
export const TPathShape = (images: PathResource) =>
	Subtrait([TPathConnections, TImageVariant], (base) => {
		abstract class IPathShape extends base {
			getImageVariant() {
				return pathShapeVariant(this.pathConnections, images);
			}
		}
		return IPathShape;
	});

// Angles are counterclockwise from the right, with y pointing up, which is what drawImage's theta expects.
export function pathShapeVariant(connections: Cell[], images: PathResource) {
	const [a, b] = connections.map((offset) => normalize(Math.atan2(offset.y, offset.x)));
	if (connections.length !== 2 || a === undefined || b === undefined) return null;
	const gap = normalize(b - a);
	if (isClose(gap, Math.PI)) {
		// The straight image is vertical; turn it for horizontal connections.
		return { image: images.straight, theta: isClose(Math.sin(a), 0) ? Math.PI / 2 : 0 };
	}
	// The turn image connects right (theta) and up (theta + PI/2).
	return { image: images.turn, theta: isClose(gap, Math.PI / 2) ? a : b };
}

const normalize = (angle: number) => ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
const isClose = (x: number, y: number) => Math.abs(x - y) < 1e-6;
