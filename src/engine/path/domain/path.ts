import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { Position } from "../../../shared/position";
import { Castle, CastleEntity, CastleEntityFixture } from "../../castle/domain/castle";

export type PathNode = Position

export class Path {
    constructor(public nodes: PathNode[], public type: string, public castleEntity: CastleEntity<Castle>) { }

    getNodes() {
        return [...this.nodes, this.castleEntity.position as Position]
    }
}


export const PathFixture = {
    default: new Path([{ x: 10, y: 90 }, { x: 10, y: 10 }, { x: 40, y: 40 }, { x: 55, y: 20 }].map((position => PercentToReal(position))), "normal",CastleEntityFixture.allied)
}