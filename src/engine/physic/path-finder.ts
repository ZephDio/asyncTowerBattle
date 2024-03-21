import { proportion } from "../../renderer/implementation/canvas-renderer";
import { Position } from "../../shared/position";
import { Path } from "../path/entity/path";

export class PathFinder {
  public isArrived = false;
  constructor(public destinations: Position[], public progress: number = 0) { }

  getOrientation(entityPosition: Position) {
    if(this.destinations.length === 1){

      console.log(this.destinations[0])
    }
    const destination = this.getNextDestination(entityPosition);
    const tetha = Math.atan2(
      destination.y - entityPosition.y,
      destination.x - entityPosition.x
    );
    return tetha;
  }

  getNextDestination(entityPosition: Position) {
    const reached = this.destinationReached(entityPosition);
    if (reached) {
      if (this.progress < this.destinations.length - 1) {
        ++this.progress;
        return this.destinations[this.progress];
      }
      this.isArrived = true;
    }
    return this.destinations[this.progress];
  }

  destinationReached(entityPosition: Position) {
    const destination = this.destinations[this.progress];
    const distance = Math.sqrt(
      Math.pow(destination.x - entityPosition.x, 2) +
      Math.pow(destination.y - entityPosition.y, 2)
    );
    if (distance < 1) return true;
    return false;
  }
}
