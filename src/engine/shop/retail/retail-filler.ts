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
import { PriestBlueprint } from "../../units/blueprint/implementation/priest-blueprint";
import { AnyUnitBlueprint } from "../../units/blueprint/units-blueprint";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { ZappingTowerBlueprint } from "../../constructs/tower/blueprint/implementation/zapping-tower-blueprint";
import { FrostTowerBlueprint } from "../../constructs/tower/blueprint/implementation/frost-tower-blueprint";
import { BersekerBlueprint } from "../../units/blueprint/implementation/berseker-blueprint";
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
		value: [ZappingTowerBlueprint, WitchHouseBlueprint, BlueTowerBlueprint, GreenTowerBlueprint, FrostTowerBlueprint],
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
			PriestBlueprint,
			BersekerBlueprint,
			ChoupissonBlueprint,
			FoxBlueprint,
			EntBlueprint,
			BrewmasterBlueprint,
		],
		share: 50,
	},
];

export class RetailFiller {
	getFreshItems(cells: Cell[]) {
		const items: { recruit: ImplementsTrait<typeof TRecruit>; price: number }[] = [];
		for (const cell of cells) {
			const item = this.generateRandomBluePrint();
			items.push({
				recruit: item.toRecruit(cell),
				price: item.price,
			});
		}
		return items;
	}

	generateRandomBluePrint() {
		const recruitPool = Random.roll(pool);
		const outComes = recruitPool.map((blueprint) => {
			const item = new blueprint({});
			return { value: item, share: item.probabilityShare };
		});
		const bluePrint = Random.roll(outComes);
		return bluePrint;
	}
}
