import { createImage } from "../../shared/image";
import { IconResource } from "./icons.resources";
import { Resource } from "./tower.resources";
import { Rarity } from "../../shared/traits/engine/rarity";

export class HudElementResources {
	static victory: Resource = {
		size: {
			width: 25,
			height: 20,
		},
		image: createImage("/resources/verdict/victory.png"),
	};

	static defeat: Resource = {
		size: {
			width: 20,
			height: 22,
		},
		image: createImage("/resources/verdict/defeat.png"),
	};

	static startBattle: IconResource = {
		image: createImage("/resources/button/start.png"),
	};

	static startGame = {
		image: createImage("/resources/button/start-game.png"),
		size: {
			width: 50,
			height: 20,
		},
	};

	static factionSelector: IconResource = {
		image: createImage("/resources/hud/selector.png"),
	};

	static slider: IconResource = {
		image: createImage("/resources/button/slider.png"),
	};

	static cursor: IconResource = {
		image: createImage("/resources/button/cursor.png"),
	};

	static banner: IconResource = {
		image: createImage("/resources/hud/banner.png"),
	};

	static descriptorBanner: Record<Rarity, IconResource> = {
		[Rarity.Common]: { image: createImage("/resources/hud/banner-descriptor/common.png") },
		[Rarity.Uncommon]: { image: createImage("/resources/hud/banner-descriptor/uncommon.png") },
		[Rarity.Rare]: { image: createImage("/resources/hud/banner-descriptor/rare.png") },
		[Rarity.Epic]: { image: createImage("/resources/hud/banner-descriptor/epic.png") },
		[Rarity.Legendary]: { image: createImage("/resources/hud/banner-descriptor/legendary.png") },
	};

	static patternStarActive: IconResource = {
		image: createImage("/resources/hud/pattern-star-active.png"),
	};

	static patternStarInactive: IconResource = {
		image: createImage("/resources/hud/pattern-star-inactive.png"),
	};

	static targetBowActive: IconResource = {
		image: createImage("/resources/hud/target-bow-active.png"),
	};

	static targetBowInactive: IconResource = {
		image: createImage("/resources/hud/target-bow-inactive.png"),
	};
}
