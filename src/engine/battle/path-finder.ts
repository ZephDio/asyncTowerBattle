import { Position } from "../../shared/position";

export class PathFinder {
  public isArrived = false;
  constructor(public destinations: Position[], public progress: number = 0) {}

  getOrientation(entityPosition: Position) {
    this.updateNextDestination(entityPosition);
    const destination = this.getNextDestination();
    const tetha = Math.atan2(destination.y - entityPosition.y, destination.x - entityPosition.x);
    return tetha;
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
    console.log(destination);
    const distance = Math.sqrt(Math.pow(destination.x - entityPosition.x, 2) + Math.pow(destination.y - entityPosition.y, 2));
    if (distance < 1) return true;
    return false;
  }
}
