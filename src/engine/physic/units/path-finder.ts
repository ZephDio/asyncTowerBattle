import { proportion } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Path } from "../../path/domain/path";

export class PathFinder {
  constructor(public path: Path, public progress: number = 0) {}

  getOrientation(entityPosition: Position) {
    const destination = this.getNextDestination(entityPosition);
    const tetha = Math.atan2(
      destination.y - entityPosition.y,
      destination.x - entityPosition.x
    );
    return tetha;
  }

  getNextDestination(entityPosition: Position) {
    if (this.destinationReached(entityPosition)) {
      if (this.progress < this.path.nodes.length - 1) ++this.progress;
    }
    return this.path.nodes[this.progress];
  }

  destinationReached(entityPosition: Position) {
    const destination = this.path.nodes[this.progress];
    const distance = Math.sqrt(
      Math.pow(destination.x - entityPosition.x, 2) +
        Math.pow(destination.y - entityPosition.y, 2)
    );
    if (distance < 1) return true;
    return false;
  }
}
