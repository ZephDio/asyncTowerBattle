import { DEFAULT_BOARDS } from "./default-boards.js";

// The blacksmith tower covers its cell and the one on its right.
describe("default boards", () => {
	const withBlacksmith = DEFAULT_BOARDS.filter((board) =>
		board.elements.some((element) => element.kind === "tower" && element.type === "blacksmith"),
	);

	it("use the blacksmith tower, which replaced the blue one", () => {
		expect(withBlacksmith.length).toBeGreaterThan(0);
		for (const board of DEFAULT_BOARDS) {
			const types = board.elements.flatMap((element) => (element.kind === "tower" ? [element.type as string] : []));
			expect(types).not.toContain("blue");
		}
	});

	it.each(withBlacksmith.map((board) => [board.round, board] as const))(
		"round %i keeps the cell next to its blacksmith tower free",
		(_round, board) => {
			for (const element of board.elements) {
				if (element.kind !== "tower" || element.type !== "blacksmith") continue;
				const right = { x: element.cell.x + 1, y: element.cell.y };
				const taken = board.elements.some(
					(other) => other !== element && "cell" in other && other.cell.x === right.x && other.cell.y === right.y,
				);
				expect(taken).toBe(false);
				expect(right.x).toBeLessThan(board.size.width);
			}
		},
	);
});
