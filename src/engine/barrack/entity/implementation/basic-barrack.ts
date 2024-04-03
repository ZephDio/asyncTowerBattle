import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Position, Cell } from "../../../../shared/position";

export class BasicBarrack extends Derive(TImageDrawable(Resources.barracks.basic.resource.image, Resources.barracks.basic.size, 2)) {
  get position(): Position | Cell {
    throw new Error("Method not implemented.");
  }
  productionSpeed: number = 3;
}
