import { Cell } from "../../shared/position";
import { PathResource } from "../../renderer/resources/path.resources";
import { pathShapeVariant } from "./path-shape";

const images = { image: "full", straight: "straight", turn: "turn" } as unknown as PathResource;
const up = new Cell({ x: 0, y: 1 });
const down = new Cell({ x: 0, y: -1 });
const left = new Cell({ x: -1, y: 0 });
const right = new Cell({ x: 1, y: 0 });

const variant = (connections: Cell[]) => {
	const result = pathShapeVariant(connections, images);
	return result && { image: result.image, quarterTurns: Math.round(result.theta / (Math.PI / 2)) };
};

describe("pathShapeVariant", () => {
	it("uses the full image for ends and tiles off the path", () => {
		expect(variant([])).toBeNull();
		expect(variant([up])).toBeNull();
	});

	it("keeps the vertical straight image for up and down, and turns it for left and right", () => {
		expect(variant([up, down])).toEqual({ image: "straight", quarterTurns: 0 });
		expect(variant([left, right])).toEqual({ image: "straight", quarterTurns: 1 });
	});

	// The turn image connects right and up; each quarter turn is counterclockwise.
	it.each([
		[[up, right], 0],
		[[right, up], 0],
		[[up, left], 1],
		[[left, down], 2],
		[[down, right], 3],
	])("rotates the turn image for %j", (connections, quarterTurns) => {
		expect(variant(connections)).toEqual({ image: "turn", quarterTurns });
	});
});
