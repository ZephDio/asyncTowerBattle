import { ImplementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../../shared/position";
import { Random } from "../../../shared/random";
import { AnyBarrackBlueprint } from "../../constructs/barrack/blueprint/barrack-blueprint";
import { BasicBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/basic-barrack-blueprint";
import { WaveBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/wave-barrack-blueprint";
import { BasicTileBlueprint } from "../../tile/blueprint/implementation/basic-path-blueprint";
import { SlowingTrapBlueprint } from "../../trap/blueprint/implementation/slowing-trap-blueprint";
import { AnyPathTileBlueprint } from "../../tile/blueprint/tile";
import { BlacksmithTowerBlueprint } from "../../constructs/tower/blueprint/implementation/blacksmith-tower-blueprint";
import { CauldronBlueprint } from "../../constructs/totem/blueprint/implementation/cauldron-blueprint";
import { ButcheryBlueprint } from "../../constructs/totem/blueprint/implementation/butchery-blueprint";
import { StonemasonBlueprint } from "../../constructs/totem/blueprint/implementation/stonemason-blueprint";
import { ForestCabinBlueprint } from "../../constructs/tower/blueprint/implementation/forest-cabin-blueprint";
import { WindmillTurretBlueprint } from "../../constructs/tower/blueprint/implementation/windmill-turret-blueprint";
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
import { LighthouseBlueprint } from "../../constructs/tower/blueprint/implementation/lighthouse-blueprint";
import { ChoupissonBlueprint } from "../../units/blueprint/implementation/choupisson-blueprint";
import { VeterantBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/veteran-barrack-blueprint";
import { HuntersAcademyBlueprint } from "../../constructs/barrack/blueprint/implementation/hunters-academy-blueprint";
import { RushBarrackBlueprint } from "../../constructs/barrack/blueprint/implementation/rush-barrack-blueprint";
import { AnyTotemBlueprint } from "../../constructs/totem/blueprint/totem-blueprint";
import { BosquetBlueprint } from "../../constructs/totem/blueprint/implementation/bosquet-blueprint";
import { AnvilTotemBlueprint } from "../../constructs/totem/blueprint/implementation/anvil-blueprint";
import { GobelinPortalBlueprint } from "../../constructs/totem/blueprint/implementation/gobelin-portal-blueprint";
import { CropsFieldBlueprint } from "../../constructs/totem/blueprint/implementation/crops-field-blueprint";
import { StunTrapBlueprint } from "../../trap/blueprint/implementation/stun-trap-blueprint";
import { AnyTrapBlueprint } from "../../trap/blueprint/trap-blueprint";
import { FrogBlueprint } from "../../units/blueprint/implementation/frog-blueprint";
import { FoxBlueprint } from "../../units/blueprint/implementation/fox-blueprint";
import { WindmillBlueprint } from "../../constructs/totem/blueprint/implementation/windmill-blueprint";
import { BakeryBlueprint } from "../../constructs/totem/blueprint/implementation/bakery-blueprint";
import { MineBlueprint } from "../../constructs/totem/blueprint/implementation/mine-blueprint";
import { BreweryBlueprint } from "../../constructs/totem/blueprint/implementation/brewery-blueprint";
import { CornFieldBlueprint } from "../../constructs/totem/blueprint/implementation/corn-field-blueprint";
import { PowderMagazineBlueprint } from "../../constructs/totem/blueprint/implementation/powder-magazine-blueprint";
import { RedObeliskBlueprint } from "../../constructs/totem/blueprint/implementation/red-obelisk";
import { EntBlueprint } from "../../units/blueprint/implementation/ent-blueprint";
import { BrewmasterBlueprint } from "../../units/blueprint/implementation/brewmaster-blueprint";
import { Rarity, rarityOf } from "../../../shared/traits/engine/rarity";
import { requiredScienceOf, Science } from "../../../shared/traits/engine/science";
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
			CornFieldBlueprint,
			WindmillBlueprint,
			BakeryBlueprint,
			MineBlueprint,
			BreweryBlueprint,
			PowderMagazineBlueprint,
			RedObeliskBlueprint,
			BosquetBlueprint,
			StonemasonBlueprint,
			ButcheryBlueprint,
			CauldronBlueprint,
		],
		share: 100,
	},
	{
		value: [
			ZappingTowerBlueprint,
			WitchHouseBlueprint,
			BlacksmithTowerBlueprint,
			WindmillTurretBlueprint,
			FrostTowerBlueprint,
			DrillTowerBlueprint,
			LighthouseBlueprint,
			ForestCabinBlueprint,
		],
		share: 100,
	},
	{
		value: [
			BasicBarrackBlueprint,
			WaveBarrackBlueprint,
			VeterantBarrackBlueprint,
			RushBarrackBlueprint,
			HuntersAcademyBlueprint,
		],
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
			FrogBlueprint,
		],
		share: 50,
	},
];

// Everything the shop sells, so the tests can check each piece survives a trip through the opponent server.
export const shopBlueprints = () => pool.flatMap(({ value }) => value);

// The shop's pieces a science unlocks.
export const blueprintsRequiring = (science: Science) =>
	shopBlueprints()
		.map((blueprint) => new blueprint({}))
		.filter((blueprint) => requiredScienceOf(blueprint) === science);

type Candidate = { blueprint: AnyBlueprint; rarity: Rarity; share: number };

// Each slot rolls a rarity from the round's odds, then an item of that rarity. An item is offered at most once per
// roll: when a rarity has nothing left to offer, the slot rolls among the rarities that still have items.
export class RetailFiller {
	constructor(
		public round: number,
		private random: () => number = Math.random,
		private sciences: ReadonlySet<Science> = new Set(),
	) {}

	getFreshItems(cells: Cell[]) {
		const items: { recruit: ImplementsTrait<typeof TRecruit>; price: number }[] = [];
		const odds = rarityOdds(this.round);
		let candidates = this.candidates();
		for (const cell of cells) {
			const rarities = Object.values(Rarity).filter(
				(rarity) => odds[rarity] > 0 && candidates.some((candidate) => candidate.rarity === rarity),
			);
			if (rarities.length === 0) break;
			const rarity = Random.roll(
				rarities.map((rarity) => ({ value: rarity, share: odds[rarity] })),
				this.random,
			);
			const picked = Random.roll(
				candidates
					.filter((candidate) => candidate.rarity === rarity)
					.map((candidate) => ({ value: candidate, share: candidate.share })),
				this.random,
			);
			candidates = candidates.filter((candidate) => candidate !== picked);
			items.push({
				recruit: picked.blueprint.toRecruit(cell),
				price: picked.blueprint.price,
			});
		}
		return items;
	}

	// Every blueprint of the pool the army can buy, weighted so that the categories keep their share of the offers
	// within a rarity. A blueprint behind a science is left out until the army holds it.
	candidates(sciences: ReadonlySet<Science> = this.sciences): Candidate[] {
		return pool.flatMap((category) => {
			const blueprints = category.value
				.map((blueprint) => new blueprint({}))
				.filter((blueprint) => {
					const required = requiredScienceOf(blueprint);
					return !required || sciences.has(required);
				});
			if (blueprints.length === 0) return [];
			const categoryShares = blueprints.reduce((sum, blueprint) => sum + blueprint.probabilityShare, 0);
			return blueprints.map((blueprint) => ({
				blueprint,
				rarity: rarityOf(blueprint),
				share: (category.share * blueprint.probabilityShare) / categoryShares,
			}));
		});
	}
}
