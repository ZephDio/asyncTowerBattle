// Where the "first time" steps of whoever plays are kept: on the server with the account for a logged-in player, in
// the browser for a guest, who has no account.
export type FirstTimeSteps = {
	tutorialSeen(): Promise<boolean>;
	markTutorialSeen(): Promise<void>;
};

const GUEST_TUTORIAL_KEY = "atb.guest.tutorialSeen";

// A guest sees the tutorial again in another browser or after clearing the site's data. Without storage, such as in a
// private window that blocks it, the guest sees it every time.
export const guestSteps = (
	storage: Pick<Storage, "getItem" | "setItem"> | undefined = safeLocalStorage(),
): FirstTimeSteps => ({
	async tutorialSeen() {
		try {
			return storage?.getItem(GUEST_TUTORIAL_KEY) === "true";
		} catch {
			return false;
		}
	},
	async markTutorialSeen() {
		try {
			storage?.setItem(GUEST_TUTORIAL_KEY, "true");
		} catch {}
	},
});

function safeLocalStorage() {
	try {
		return localStorage;
	} catch {
		return undefined;
	}
}

// Opens the tutorial if these steps haven't seen it yet, and records that it was shown: closing it, or leaving, never
// brings it back by itself, the "?" button still opens it. When the steps can't be read, the tutorial stays closed
// rather than opening on every visit.
export const openTutorialOnFirstTime = async (steps: FirstTimeSteps, openTutorial: () => void): Promise<boolean> => {
	try {
		if (await steps.tutorialSeen()) return false;
	} catch {
		return false;
	}
	openTutorial();
	await steps.markTutorialSeen().catch(() => undefined);
	return true;
};
