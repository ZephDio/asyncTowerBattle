import { ImplementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../../shared/position";
import { Random } from "../../../shared/random";
import { AnyBarrackBlueprint } from "../../constructs/barrack/blueprint/barrack-blueprint";
import { BasicBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/basic-barrack-blueprint";
import { WaveBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/wave-barrack-blueprint";
import { BasicTileBlueprint } from "../../tile/blueprint/implementation/basic-path-blueprint";
import { SlowingTrapBlueprint } from "../../trap/blueprint/implementation/slowing-trap-blueprint";
import { AnyPathTileBlueprint } from "../../tile/blueprint/tile";
import { BlueTowerBlueprint } from "../../constructs/tower/blueprint/implementation/blue-tower-blueprint";
import { GreenTowerBlueprint } from "../../constructs/tower/blueprint/implementation/green-tower-blueprint";
import { WitchHouseBlueprint } from "../../constructs/tower/blueprint/implementation/witch-house-blueprint";
import { AnyTowerBlueprint } from "../../constructs/tower/blueprint/tower-blueprint";
import { DragonBlueprint } from "../../units/blueprint/implementation/dragon-blueprint";
import { GoGoatBlueprint } from "../../units/blueprint/implementation/go-goat-blueprint";
import { ParadiseBirdBlueprint } from "../../units/blueprint/implementation/paradise-bird-blueprint";
import { WhiteStagBlueprint } from "../../units/blueprint/implementation/white-stag-blueprint";
import { AnyUnitBlueprint } from "../../units/blueprint/units-blueprint";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { ZappingTowerBlueprint } from "../../constructs/tower/blueprint/implementation/zapping-tower-blueprint";
import { FrostTowerBlueprint } from "../../constructs/tower/blueprint/implementation/frost-tower-blueprint";
import { DrillTowerBlueprint } from "../../constructs/tower/blueprint/implementation/drill-tower-blueprint";
import { ChoupissonBlueprint } from "../../units/blueprint/implementation/choupisson-blueprint";
import { VeterantBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/veteran-barrack-blueprint";
import { AnyTotemBlueprint } from "../../constructs/totem/blueprint/totem-blueprint";
import { AnvilTotemBlueprint } from "../../constructs/totem/blueprint/implementation/anvil-blueprint";
import { GobelinPortalBlueprint } from "../../constructs/totem/blueprint/implementation/gobelin-portal-blueprint";
import { CropsFieldBlueprint } from "../../constructs/totem/blueprint/implementation/crops-field-blueprint";
import { StunTrapBlueprint } from "../../trap/blueprint/implementation/stun-trap-blueprint";
import { AnyTrapBlueprint } from "../../trap/blueprint/trap-blueprint";
import { FoxBlueprint } from "../../units/blueprint/implementation/fox-blueprint";
import { WindmillBlueprint } from "../../constructs/totem/blueprint/implementation/windmill-blueprint";
import { BakeryBlueprint } from "../../constructs/totem/blueprint/implementation/bakery-blueprint";
import { MineBlueprint } from "../../constructs/totem/blueprint/implementation/mine-blueprint";
import { BreweryBlueprint } from "../../constructs/totem/blueprint/implementation/brewery-blueprint";
import { PowderMagazineBlueprint } from "../../constructs/totem/blueprint/implementation/powder-magazine-blueprint";
import { RedObeliskBlueprint } from "../../constructs/totem/blueprint/implementation/red-obelisk";
import { EntBlueprint } from "../../units/blueprint/implementation/ent-blueprint";
import { BrewmasterBlueprint } from "../../units/blueprint/implementation/brewmaster-blueprint";
import { Rarity, rarityOf } from "../../../shared/traits/engine/rarity";
import { rarityOdds } from "./rarity-odds";

export type Constructor<C> = { new (...args: any[]): C };
type AnyBlueprint =
	| AnyTowerBlueprint
	| AnyPathTileBlueprint
	| AnyTrapBlueprint
	| AnyUnitBlueprint
	| AnyBarrackBlueprint
	| AnyTotemBlueprint;
// TODO trait blueprint
const pool: { value: Constructor<AnyBlueprint>[]; share: number }[] = [
	{
		value: [
			AnvilTotemBlueprint,
			GobelinPortalBlueprint,
			CropsFieldBlueprint,
			WindmillBlueprint,
			BakeryBlueprint,
			MineBlueprint,
			BreweryBlueprint,
			PowderMagazineBlueprint,
			RedObeliskBlueprint,
		],
		share: 100,
	},
	{
		value: [
			ZappingTowerBlueprint,
			WitchHouseBlueprint,
			BlueTowerBlueprint,
			GreenTowerBlueprint,
			FrostTowerBlueprint,
			DrillTowerBlueprint,
		],
		share: 100,
	},
	{
		value: [BasicBarrackBlueprint, WaveBarrackBlueprint, VeterantBarrackBlueprint],
		share: 60,
	},
	{
		value: [BasicTileBlueprint, SlowingTrapBlueprint, StunTrapBlueprint],
		share: 35,
	},
	{
		value: [
			DragonBlueprint,
			WhiteStagBlueprint,
			ChoupissonBlueprint,
			FoxBlueprint,
			EntBlueprint,
			BrewmasterBlueprint,
			GoGoatBlueprint,
			ParadiseBirdBlueprint,
		],
		share: 50,
	},
];

type Candidate = { blueprint: AnyBlueprint; rarity: Rarity; share: number };

// Each slot rolls a rarity from the round's odds, then an item of that rarity. An item is offered at most once per
// roll: when a rarity has nothing left to offer, the slot rolls among the rarities that still have items.
export class RetailFiller {
	constructor(public round: number) {}

	getFreshItems(cells: Cell[]) {
		const items: { recruit: ImplementsTrait<typeof TRecruit>; price: number }[] = [];
		const odds = rarityOdds(this.round);
		let candidates = this.candidates();
		for (const cell of cells) {
			const rarities = Object.values(Rarity).filter(
				(rarity) => odds[rarity] > 0 && candidates.some((candidate) => candidate.rarity === rarity),
			);
			if (rarities.length === 0) break;
			const rarity = Random.roll(rarities.map((rarity) => ({ value: rarity, share: odds[rarity] })));
			const picked = Random.roll(
				candidates
					.filter((candidate) => candidate.rarity === rarity)
					.map((candidate) => ({ value: candidate, share: candidate.share })),
			);
			candidates = candidates.filter((candidate) => candidate !== picked);
			items.push({
				recruit: picked.blueprint.toRecruit(cell),
				price: picked.blueprint.price,
			});
		}
		return items;
	}

	// Every blueprint of the pool, weighted so that the categories keep their share of the offers within a rarity.
	candidates(): Candidate[] {
		return pool.flatMap((category) => {
			const blueprints = category.value.map((blueprint) => new blueprint({}));
			const categoryShares = blueprints.reduce((sum, blueprint) => sum + blueprint.probabilityShare, 0);
			return blueprints.map((blueprint) => ({
				blueprint,
				rarity: rarityOf(blueprint),
				share: (category.share * blueprint.probabilityShare) / categoryShares,
			}));
		});
	}
}
