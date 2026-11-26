import { Science, grantedSciencesOf } from "./science";

describe("grantedSciencesOf", () => {
	it("reads the sciences an element grants", () => {
		expect(grantedSciencesOf({ grantedSciences: [Science.Elf] })).toEqual([Science.Elf]);
	});

	it("falls back to what the element is described as, as a battle tower does for its recruit", () => {
		const recruit = { grantedSciences: [Science.Witchcraft] };
		expect(grantedSciencesOf({ describedBy: recruit })).toEqual([Science.Witchcraft]);
	});

	it("grants nothing without sciences and ignores an element described as itself", () => {
		const loop: { describedBy?: object } = {};
		loop.describedBy = loop;
		expect(grantedSciencesOf({})).toEqual([]);
		expect(grantedSciencesOf(loop)).toEqual([]);
	});
});
