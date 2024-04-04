import { Physic } from "../../shared/physic";
import { Position } from "../../shared/position";

export class PathFinder {
	public isArrived = false;
	constructor(
		public destinations: Position[],
		public progress: number = 0,
	) {}

	getOrientation(entityPosition: Position) {
		this.updateNextDestination(entityPosition);
		const destination = this.getNextDestination();
		if (!destination) throw new Error("No next destination");

		const theta = Physic.getTheta(entityPosition, destination);
		return theta;
	}

	getNextPositionAndOrientation(position: Position, speed: number) {
		this.updateNextDestination(position);
		const destination = this.getNextDestination();
		if (!destination) throw new Error("No next destination");
		const [nextPosition, theta] = Physic.getNextPositionAndOrientation(position, destination, speed);
		return [nextPosition, theta] as const;
	}

	getNextPosition(position: Position, speed: number) {
		this.updateNextDestination(position);
		const destination = this.getNextDestination();
		if (!destination) throw new Error("No next destination");
		const [nextPosition] = Physic.getNextPositionAndOrientation(position, destination, speed);
		return nextPosition;
	}
	getNextDestination() {
		return this.destinations[this.progress];
	}

	updateNextDestination(entityPosition: Position) {
		const reached = this.destinationReached(entityPosition);
		if (reached) {
			if (this.progress < this.destinations.length - 1) {
				this.progress++;
				return;
			}
			this.isArrived = true;
		}
	}

	destinationReached(entityPosition: Position) {
		const destination = this.getNextDestination();
		if (!destination) return false;
		const distance = Physic.getDistanceSqrd(entityPosition, destination);
		if (distance < 0.2) return true;
		return false;
	}
}
