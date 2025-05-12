import { createImage } from "../../shared/image";
import { IconResource } from "./icons.resources";
import { Resource } from "./tower.resources";

export class HudElementResources {
  static victory: Resource = {
    size: {
      width: 25,
      height: 20,
    },
    image: createImage("/resources/verdict/victory.png"),
  }

  static defeat: Resource = {
		size: {
			width: 20,
			height: 22,
		},
		image: createImage("/resources/verdict/defeat.png"),
	}

  static startBattle: IconResource = {
		image: createImage("/resources/button/start.png"),
	}

  static startGame = {
		image: createImage("/resources/button/start-game.png"),
		size: {
			width: 50,
			height: 20,
		},
	}

  static factionSelector : IconResource = {
    image: createImage("/resources/hud/selector.png"),
  }

  static slider : IconResource = {
    image: createImage("/resources/button/slider.png"),
  }

  static cursor: IconResource = {
    image: createImage("/resources/button/cursor.png"),
  }

  static banner: IconResource = {
    image: createImage("/resources/hud/banner.png")
  }
}