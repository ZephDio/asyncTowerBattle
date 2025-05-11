import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid";
import { createImage } from "../../shared/image";
import { Resource } from "./tower.resources";

export class PathResources {
  static normal: Resource = {
    size: {
      width: STANDARD_CELL_SIZE,
      height: STANDARD_CELL_SIZE,
    },
    image: createImage("/resources/path/normal.png"),
  }

  static slowing: Resource = {
    size: {
      width: STANDARD_CELL_SIZE,
      height: STANDARD_CELL_SIZE,
    },
    image: createImage("/resources/path/slowing.png"),
  }

  static trap: Resource = {
    size: {
      width: STANDARD_CELL_SIZE,
      height: STANDARD_CELL_SIZE,
    },
    image: createImage("/resources/path/trap.png"),
  }
}