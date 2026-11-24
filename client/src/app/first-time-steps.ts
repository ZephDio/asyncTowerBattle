// Where the "first time" steps of a logged-in player are kept: on the server, with their account. A guest has none and
// gets the tutorial each time they start playing as one.
export type FirstTimeSteps = {
	tutorialSeen(): Promise<boolean>;
	markTutorialSeen(): Promise<void>;
};

// Opens the tutorial if these steps haven't seen it yet, and records that it was shown, unless opening it was refused
// by returning false: closing it, or leaving, never
// brings it back by itself, the "?" button still opens it. When the steps can't be read, the tutorial stays closed
// rather than opening on every visit.
export const openTutorialOnFirstTime = async (
	steps: FirstTimeSteps,
	openTutorial: () => boolean | void,
): Promise<boolean> => {
	try {
		if (await steps.tutorialSeen()) return false;
	} catch {
		return false;
	}
	if (openTutorial() === false) return false;
	await steps.markTutorialSeen().catch(() => undefined);
	return true;
};
