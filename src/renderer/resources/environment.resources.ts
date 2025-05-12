import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid"
import { createImage } from "../../shared/image"
import { ShapedResource } from "./tower.resources"

export class EnvironmentResources {
  static rock: ShapedResource = {
    image: createImage("/resources/environment/rock.png"),
    shape: "ellipse",
    size: {
      width: STANDARD_CELL_SIZE,
      height: STANDARD_CELL_SIZE,
    },
  }
  static forest: ShapedResource = {
    image: createImage("/resources/environment/forest.png"),
    shape: "ellipse",
    size: {
      width: STANDARD_CELL_SIZE,
      height: STANDARD_CELL_SIZE,
    },
  }
}