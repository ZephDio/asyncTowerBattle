import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";

export enum Rarity {
	Common = "common",
	Uncommon = "uncommon",
	Rare = "rare",
	Epic = "epic",
	Legendary = "legendary",
}

export const TRarity = (rarity: Rarity) =>
	Trait((base) => {
		abstract class IRarity extends base {
			rarity: Rarity = rarity;
		}
		return IRarity;
	});

// TRarity is a factory, so implementsTrait can't detect it: read the field instead. Elements without a rarity, like
// environment pieces, count as common.
export function rarityOf(element: object): Rarity {
	return "rarity" in element ? (element.rarity as Rarity) : Rarity.Common;
}

// Recruits and battle entities copy the rarity of the piece they are built from.
export const HTRarity = Subtrait([TRarity(Rarity.Common)], (base, Props) => {
	abstract class IRarityHolder extends base {
		declare rarity: Rarity;
		constructor(props: { rarityHolder: ImplementsTrait<ReturnType<typeof TRarity>> } & typeof Props) {
			super(props);
			this.rarity = props.rarityHolder.rarity;
		}
	}
	return IRarityHolder;
});
