import { guestSteps, openTutorialOnFirstTime, type FirstTimeSteps } from "./first-time-steps";

const memoryStorage = () => {
	const values = new Map<string, string>();
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => void values.set(key, value),
	};
};

describe("openTutorialOnFirstTime", () => {
	it("opens the tutorial once for a guest, and not on the next visit", async () => {
		const storage = memoryStorage();
		let opened = 0;
		const open = () => void opened++;

		expect(await openTutorialOnFirstTime(guestSteps(storage), open)).toBe(true);
		expect(await openTutorialOnFirstTime(guestSteps(storage), open)).toBe(false);

		expect(opened).toBe(1);
	});

	it("opens it again for a guest with a fresh storage", async () => {
		let opened = 0;
		await openTutorialOnFirstTime(guestSteps(memoryStorage()), () => void opened++);
		await openTutorialOnFirstTime(guestSteps(memoryStorage()), () => void opened++);
		expect(opened).toBe(2);
	});

	it("opens it every time without storage", async () => {
		let opened = 0;
		const throwing = {
			getItem: () => {
				throw new Error("blocked");
			},
			setItem: () => {
				throw new Error("blocked");
			},
		};
		await openTutorialOnFirstTime(guestSteps(throwing), () => void opened++);
		await openTutorialOnFirstTime(guestSteps(throwing), () => void opened++);
		expect(opened).toBe(2);
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
