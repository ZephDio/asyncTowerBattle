import { type FirstTimeSteps, openTutorialOnFirstTime } from "./first-time-steps";

// Steps kept in memory, as the server keeps them for a player.
const memorySteps = (): FirstTimeSteps => {
	let seen = false;
	return {
		tutorialSeen: async () => seen,
		markTutorialSeen: async () => void (seen = true),
	};
};

describe("openTutorialOnFirstTime", () => {
	it("opens the tutorial once, and not on the next visit", async () => {
		const steps = memorySteps();
		let opened = 0;
		const open = () => void opened++;

		expect(await openTutorialOnFirstTime(steps, open)).toBe(true);
		expect(await openTutorialOnFirstTime(steps, open)).toBe(false);

		expect(opened).toBe(1);
	});

	it("doesn't record the tutorial as seen when opening it was refused", async () => {
		const steps = memorySteps();
		expect(await openTutorialOnFirstTime(steps, () => false)).toBe(false);
		expect(await steps.tutorialSeen()).toBe(false);
	});

	it("stays closed when the steps can't be read", async () => {
		const unreachable: FirstTimeSteps = {
			tutorialSeen: () => Promise.reject(new Error("offline")),
			markTutorialSeen: () => Promise.resolve(),
		};
		let opened = 0;
		expect(await openTutorialOnFirstTime(unreachable, () => void opened++)).toBe(false);
		expect(opened).toBe(0);
	});

	it("still opens it when recording that it was seen fails", async () => {
		const failing: FirstTimeSteps = {
			tutorialSeen: () => Promise.resolve(false),
			markTutorialSeen: () => Promise.reject(new Error("offline")),
		};
		let opened = 0;
		expect(await openTutorialOnFirstTime(failing, () => void opened++)).toBe(true);
		expect(opened).toBe(1);
	});
});
