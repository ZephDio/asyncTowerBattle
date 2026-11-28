import { secondsToFrame } from "../../../shared/seconds";
import { Furry } from "./furry";

const amountAt = (seconds: number) => {
	const timer = { clock: 0 };
	const furry = new Furry(0, 0, () => timer);
	for (timer.clock = 0; timer.clock <= secondsToFrame(seconds); timer.clock++) furry.tick();
	return furry.amount;
};

describe("Furry", () => {
	it("starts at 30 seconds", () => {
		expect(amountAt(29.9)).toBe(0);
		expect(amountAt(30)).toBe(1);
	});

	it("triggers every 3 seconds, each trigger adding one more than the last", () => {
		expect(amountAt(32.9)).toBe(1);
		expect(amountAt(33)).toBe(3);
		expect(amountAt(36)).toBe(6);
		expect(amountAt(57)).toBe(55);
	});
});
