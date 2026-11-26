import "../../../../engine/grid/grid";
import { formatStat, liveStat } from "./item-descriptor";

describe("stat formatting", () => {
	it("shows a stat a piece does not have (NaN) as 0, neither better nor worse", () => {
		expect(formatStat(NaN)).toBe("0");
		expect(liveStat("0", NaN, NaN)).toEqual({ value: "0", trend: "neutral" });
	});

	it("keeps formatting real stats", () => {
		expect(formatStat(1.2345)).toBe("1.23");
		expect(liveStat("3", 3, 2).trend).toBe("better");
	});
});
