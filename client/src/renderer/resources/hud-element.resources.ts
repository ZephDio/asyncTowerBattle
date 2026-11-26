import { createImage } from "../../shared/image";
import { IconResource } from "./icons.resources";
import { Rarity } from "../../shared/traits/engine/rarity";

export type DescriptorScrollParts = Record<
	| "rollLeft"
	| "roll"
	| "rollRight"
	| "handleLeft"
	| "handleRight"
	| "edgeLeft"
	| "edgeRight"
	| "center"
	| "shade"
	| "shadow",
	HTMLImageElement
> & {
	// The decoration of the sheet's margins, from the uncommon scroll on.
	decoLeft?: HTMLImageElement;
	decoRight?: HTMLImageElement;
	// The ornaments sticking out of the footer's ends, from the epic scroll on.
	ornamentLeft?: HTMLImageElement;
	ornamentRight?: HTMLImageElement;
};

function descriptorScrollParts(rarity: string, decorated = false, ornamented = false): DescriptorScrollParts {
	const part = (name: string) => createImage(`/resources/hud/descriptor-scroll/${rarity}/${name}.png`);
	return {
		rollLeft: part("roll-left"),
		roll: part("roll"),
		rollRight: part("roll-right"),
		handleLeft: part("handle-left"),
		handleRight: part("handle-right"),
		edgeLeft: part("edge-left"),
		edgeRight: part("edge-right"),
		center: part("center"),
		shade: part("shade"),
		shadow: part("shadow"),
		...(decorated ? { decoLeft: part("deco-left"), decoRight: part("deco-right") } : {}),
		...(ornamented ? { ornamentLeft: part("ornament-left"), ornamentRight: part("ornament-right") } : {}),
	};
}

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

	// The nine pieces of the wooden plank panel of the shop, drawn by scripts/generate-wood-panel.py.
	static woodPanel = {
		topLeft: createImage("/resources/hud/wood-panel/top-left.png"),
		top: createImage("/resources/hud/wood-panel/top.png"),
		topRight: createImage("/resources/hud/wood-panel/top-right.png"),
		left: createImage("/resources/hud/wood-panel/left.png"),
		center: createImage("/resources/hud/wood-panel/center.png"),
		right: createImage("/resources/hud/wood-panel/right.png"),
		bottomLeft: createImage("/resources/hud/wood-panel/bottom-left.png"),
		bottom: createImage("/resources/hud/wood-panel/bottom.png"),
		bottomRight: createImage("/resources/hud/wood-panel/bottom-right.png"),
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

	// The pieces of the descriptor's scroll, drawn by scripts/generate-descriptor-scroll.py. Only the common to epic ones
	// are drawn so far: legendary uses the epic one until it is.
	static descriptorScroll: Record<Rarity, DescriptorScrollParts> = (() => {
		const common = descriptorScrollParts("common");
		const uncommon = descriptorScrollParts("uncommon", true);
		const rare = descriptorScrollParts("rare", true);
		const epic = descriptorScrollParts("epic", true, true);
		return {
			[Rarity.Common]: common,
			[Rarity.Uncommon]: uncommon,
			[Rarity.Rare]: rare,
			[Rarity.Epic]: epic,
			[Rarity.Legendary]: epic,
		};
	})();

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
