import { createImage } from "../../shared/image";
import { SpriteSheet } from "../../shared/sprite-sheet";
import { Science } from "../../shared/traits/engine/science";

export type IconResource = {
	image: HTMLImageElement;
};
export class IconResources {
	static scienceStamps: Record<Science, IconResource> = {
		[Science.Elf]: { image: createImage("/resources/icons/science-elf.png") },
		[Science.Dwarf]: { image: createImage("/resources/icons/science-dwarf.png") },
		[Science.Witchcraft]: { image: createImage("/resources/icons/science-witchcraft.png") },
		[Science.Trap]: { image: createImage("/resources/icons/science-trap.png") },
	};
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
	static castleDamage: IconResource = {
		image: createImage("/resources/icons/unit-castle-damage.png"),
	};
	static patternStar: IconResource = {
		image: createImage("/resources/icons/pattern-star-active.png"),
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
	static armyBuffMovespeed: IconResource = {
		image: createImage("/resources/icons/army-buff/unit-speed.png"),
	};
	static armyBuffVitality: IconResource = {
		image: createImage("/resources/icons/army-buff/unit-health.png"),
	};
	static armyBuffTowerCastSpeed: IconResource = {
		image: createImage("/resources/icons/army-buff/tower-cast-speed.png"),
	};
	static armyBuffAttack: IconResource = {
		image: createImage("/resources/icons/army-buff/tower-attack.png"),
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
