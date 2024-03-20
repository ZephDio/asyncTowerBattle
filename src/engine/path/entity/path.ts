import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";

export type PathNode = Position;

export class Path {
  constructor(
    public nodes: PathNode[],
    public type: string,
    public castleEntity: CastleRecruit<Castle>
  ) {}

  getNodes() {
    return [...this.nodes, this.castleEntity.position as Position];
  }
}
