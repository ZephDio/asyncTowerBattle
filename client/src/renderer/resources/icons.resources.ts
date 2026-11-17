import { createImage } from "../../shared/image";
import { SpriteSheet } from "../../shared/sprite-sheet";

export type IconResource = {
	image: HTMLImageElement;
};
export class IconResources {
	static food: IconResource = {
		image: createImage("/resources/icons/corn.png"),
	};
	static heartContainer: IconResource = {
		image: createImage("/resources/icons/heart-container.png"),
	};
	static emptyHeartContainer: IconResource = {
		image: createImage("/resources/icons/heart-container-empty.png"),
	};
	static movespeed: IconResource = {
		image: createImage("/resources/icons/unit-speed.png"),
	};
	static vitality: IconResource = {
		image: createImage("/resources/icons/unit-health.png"),
	};
	static castSpeed: IconResource = {
		image: createImage("/resources/hud/cast-speed.svg"),
	};
	static towerCastSpeed: IconResource = {
		image: createImage("/resources/icons/tower-cast-speed.png"),
	};
	static attack: IconResource = {
		image: createImage("/resources/icons/tower-attack.png"),
	};
	static tower: IconResource = {
		image: createImage("/resources/hud/tower.svg"),
	};
	static unit: IconResource = {
		image: createImage("/resources/hud/unit.svg"),
	};
	static furry: IconResource = {
		image: createImage("/resources/hud/furry.png"),
	};
	static gold: IconResource = {
		image: createImage("/resources/icons/gold.png"),
	};
	static purse: IconResource = {
		image: createImage("/resources/economy/purse.png"),
	};
	static bell: IconResource = {
		image: createImage("/resources/button/bell.png"),
	};
	static bellPressSheet = SpriteSheet.fromJson("/resources/button/bell.sheet.png", "/resources/button/bell.sheet.json");
}
