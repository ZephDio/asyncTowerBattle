import { secondsToFrame } from "../../../shared/seconds";

export class Furry {
	startingTime = 20;
	constructor(
		public furryIncrease = 0,
		public amount: number,
		private getTimer: () => { clock: number },
	) {}

	tick() {
		const time = this.getTimer().clock;
		if (time >= secondsToFrame(this.startingTime)) {
			if ((time - secondsToFrame(this.startingTime)) % secondsToFrame(2) === 0) {
				this.increaseFurry();
			}
		}
	}

	increaseFurry() {
		this.addFurry(++this.furryIncrease);
	}

	getFurry() {
		return this.amount;
	}

	addFurry(amount: number) {
		this.amount += amount;
	}
}
