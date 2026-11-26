import { createImage } from "../../shared/image";
import { IconResource } from "./icons.resources";
import { Rarity } from "../../shared/traits/engine/rarity";

export class HudElementResources {
	static startBattle: IconResource = {
		image: createImage("/resources/button/start.png"),
	};

	static continueButton: IconResource = {
		image: createImage("/resources/button/continue.png"),
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

	static armyBanner = {
		Elf: { image: createImage("/resources/hud/army-elf.png") },
		Dwarf: { image: createImage("/resources/hud/army-dwarf.png") },
	};

	static battleArmyBanner = {
		Elf: { image: createImage("/resources/hud/battle-elf.png") },
		Dwarf: { image: createImage("/resources/hud/battle-dwarf.png") },
	};

	// The ribbon the shop's science seals hang on, drawn by scripts/generate-science-ribbon.py.
	static scienceRibbon = {
		top: { image: createImage("/resources/hud/science-ribbon/top.png") },
		segment: { image: createImage("/resources/hud/science-ribbon/segment.png") },
		tail: { image: createImage("/resources/hud/science-ribbon/tail.png") },
		halo: { image: createImage("/resources/hud/science-ribbon/halo.png") },
	};

	// The nine pieces of the parchment scroll of the tooltips, drawn by scripts/generate-scroll.py.
	static scroll = {
		topLeft: createImage("/resources/hud/scroll/top-left.png"),
		top: createImage("/resources/hud/scroll/top.png"),
		topRight: createImage("/resources/hud/scroll/top-right.png"),
		left: createImage("/resources/hud/scroll/left.png"),
		center: createImage("/resources/hud/scroll/center.png"),
		right: createImage("/resources/hud/scroll/right.png"),
		bottomLeft: createImage("/resources/hud/scroll/bottom-left.png"),
		bottom: createImage("/resources/hud/scroll/bottom.png"),
		bottomRight: createImage("/resources/hud/scroll/bottom-right.png"),
	};

	static banner: IconResource = {
		image: createImage("/resources/hud/banner.png"),
	};

	// A battle captured in the game, shown in the tutorial to explain who walks where.
	static tutorialBattle: IconResource = {
		image: createImage("/resources/hud/tutorial-battle.png"),
	};

	static descriptorBanner: Record<Rarity, IconResource> = {
		[Rarity.Common]: { image: createImage("/resources/hud/banner-descriptor/common.png") },
		[Rarity.Uncommon]: { image: createImage("/resources/hud/banner-descriptor/uncommon.png") },
		[Rarity.Rare]: { image: createImage("/resources/hud/banner-descriptor/rare.png") },
		[Rarity.Epic]: { image: createImage("/resources/hud/banner-descriptor/epic.png") },
		[Rarity.Legendary]: { image: createImage("/resources/hud/banner-descriptor/legendary.png") },
	};

	static patternStarActive: IconResource = {
		image: createImage("/resources/icons/pattern-star-active.png"),
	};

	static patternStarInactive: IconResource = {
		image: createImage("/resources/icons/pattern-star-inactive.png"),
	};

	static targetBowActive: IconResource = {
		image: createImage("/resources/hud/target-bow-active.png"),
	};

	static targetBowInactive: IconResource = {
		image: createImage("/resources/hud/target-bow-inactive.png"),
	};
}
