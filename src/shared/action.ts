export class Action {
	progress = 0;
	constructor(
		private actionSpeed: number,
		protected readonly resolve: () => void,
	) {}

	tick() {
		this.progress += this.actionSpeed;
		if (this.progress >= 100) {
			this.resolve();
		}
	}
}
