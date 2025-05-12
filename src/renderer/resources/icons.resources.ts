import { createImage } from "../../shared/image"

export type IconResource = {
  image: HTMLImageElement
}
export class IconResources {
  static food: IconResource = {
    image: createImage("/resources/economy/food.png"),
  }
  static health: IconResource = {
    image: createImage("/resources/hud/health.png"),
  }
  static emptyHealth: IconResource = {
    image: createImage("/resources/hud/health-empty.png"),
  }
  static movespeed: IconResource = {
    image: createImage("/resources/hud/speed.svg"),
  }
  static vitality: IconResource = {
    image: createImage("/resources/hud/vitality.svg"),
  }
  static castSpeed: IconResource = {
    image: createImage("/resources/hud/cast-speed.svg"),
  }
  static attack: IconResource = {
    image: createImage("/resources/hud/attack.svg"),
  }
  static tower: IconResource = {
    image: createImage("/resources/hud/tower.svg"),
  }
  static unit: IconResource = {
    image: createImage("/resources/hud/unit.svg"),
  }
  static furry: IconResource = {
    image: createImage("/resources/hud/furry.png"),
  }
  static gold : IconResource = {
    image: createImage("/resources/economy/gold.png"),
  }
  static bell: IconResource = {
    image: createImage("/resources/button/bell.png"),
  }
}