// The "first time" steps of a registered player's journey, such as the tutorial that opens by itself once. Guests have
// none: the game keeps theirs in the browser.
export type PlayerStepsProps = { playerId: string; tutorialSeen: boolean };

export class PlayerSteps {
	readonly playerId: string;
	readonly tutorialSeen: boolean;

	constructor({ playerId, tutorialSeen }: PlayerStepsProps) {
		this.playerId = playerId;
		this.tutorialSeen = tutorialSeen;
	}

	// The steps of a player who has done none.
	static none(playerId: string) {
		return new PlayerSteps({ playerId, tutorialSeen: false });
	}

	withTutorialSeen() {
		return new PlayerSteps({ ...this.toProps(), tutorialSeen: true });
	}

	toProps(): PlayerStepsProps {
		return { playerId: this.playerId, tutorialSeen: this.tutorialSeen };
	}
}
