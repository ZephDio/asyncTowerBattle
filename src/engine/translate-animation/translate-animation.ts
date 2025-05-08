import { RelativePosition } from "../../shared/hitbox/hitboxe";
import { Physic } from "../../shared/physic";

export class TranslateAnimation {
	startingPosition: RelativePosition;
	constructor(
		public duration: number,
		public position: RelativePosition,
		public targetPosition: RelativePosition,

		_startingPosition?: RelativePosition,
		public callback?: () => void,
		public callTick?: (position: RelativePosition, time: number) => void,
	) {
		if (!_startingPosition) {
			this.startingPosition = position.clone();
			return;
		}
		this.startingPosition = _startingPosition;
	}

	startAnimation() {
		if (this.startingPosition) {
			this.position.x = this.startingPosition.x;
			this.position.y = this.startingPosition.y;
		}
		const theta = Physic.getTheta(this.position, this.targetPosition);
		const distance = Physic.getDistance(this.position, this.targetPosition);
		const acceleration = this.calculateVelocityProfile(distance, this.duration);

		let time = 0;
		const interval = setInterval(() => {
			time += 1;
			const speed = this.calculateSpeedAtTime(time, acceleration);
			this.position.x += speed * Math.cos(theta);
			this.position.y += speed * Math.sin(theta);

			if (this.callTick) {
				this.callTick(this.position, time);
			}
			if (time >= this.duration) {
				clearInterval(interval);
				this.position.x = this.targetPosition.x;
				this.position.y = this.targetPosition.y;
				if (this.callback) {
					this.callback();
				}
			}
		}, 31);
	}

	calculateSpeedAtTime(t: number, acceleration: number): number {
		if (t < this.duration / 2) {
			return acceleration * t;
		}
		const deceleratingTime = this.duration - t;
		return acceleration * deceleratingTime;
	}

	calculateVelocityProfile(distance: number, duration: number) {
		const acceleration = (4 * distance) / duration ** 2;
		return acceleration;
	}
}
