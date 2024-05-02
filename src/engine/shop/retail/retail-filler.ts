import { ImplementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../../shared/position";
import { Random } from "../../../shared/random";
import { AnyBarrackBlueprint } from "../../barrack/blueprint/barrack-blueprint";
import { BasicBarrackBlueprint } from "../../barrack/blueprint/implementation/basic-barrack-blueprint";
import { WaveBarrackBlueprint } from "../../barrack/blueprint/implementation/wave-barrack-blueprint";
import { BasicTileBlueprint } from "../../tile/blueprint/implementation/basic-path-blueprint";
import { SlowingTileBlueprint } from "../../tile/blueprint/implementation/slowing-tile-blueprint";
import { AnyPathTileBlueprint } from "../../tile/blueprint/tile";
import { BlueTowerBlueprint } from "../../tower/blueprint/implementation/blue-tower-blueprint";
import { GreenTowerBlueprint } from "../../tower/blueprint/implementation/green-tower-blueprint";
import { WitchHouseBlueprint } from "../../tower/blueprint/implementation/witch-house-blueprint";
import { AnyTowerBlueprint } from "../../tower/blueprint/tower-blueprint";
import { DragonBlueprint } from "../../units/blueprint/implementation/dragon-blueprint";
import { PriestBlueprint } from "../../units/blueprint/implementation/priest-blueprint";
import { SoldierBlueprint } from "../../units/blueprint/implementation/soldier-blueprint";
import { AnyUnitBlueprint } from "../../units/blueprint/units-blueprint";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { ZappingTowerBlueprint } from "../../tower/blueprint/implementation/zapping-tower-blueprint";
import { FrostTowerBlueprint } from "../../tower/blueprint/implementation/frost-tower-blueprint";
import { BersekerBlueprint } from "../../units/blueprint/implementation/berseker-blueprint";
import { ChoupissonBlueprint } from "../../units/blueprint/implementation/choupisson-blueprint";
import { VeterantBarrackBlueprint } from "../../barrack/blueprint/implementation/veteran-barrack-blueprint";
import { AnyTotemBlueprint } from "../../totem/blueprint/totem-blueprint";
import { AnvilTotemBlueprint } from "../../totem/blueprint/implementation/anvil-blueprint";
import { GobelinPortalBlueprint } from "../../totem/blueprint/implementation/gobelin-portal-blueprint";
import { CropsFieldBlueprint } from "../../totem/blueprint/implementation/crops-field-blueprint";
import { TrapTileBlueprint } from "../../tile/blueprint/implementation/trap-tile-blueprint";
import { FoxBlueprint } from "../../units/blueprint/implementation/fox-blueprint";
import { WindmillBlueprint } from "../../totem/blueprint/implementation/windmill-blueprint";
import { BakeryBlueprint } from "../../totem/blueprint/implementation/bakery-blueprint";
import { MineBlueprint } from "../../totem/blueprint/implementation/mine-blueprint";
import { BreweryBlueprint } from "../../totem/blueprint/implementation/brewery-blueprint";
import { PowderMagazineBlueprint } from "../../totem/blueprint/implementation/powder-magazine-blueprint";

export type Constructor<C> = { new (...args: any[]): C };
type AnyBlueprint =
	| AnyTowerBlueprint
	| AnyPathTileBlueprint
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
			PowderMagazineBlueprint
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
		value: [BasicTileBlueprint, SlowingTileBlueprint, TrapTileBlueprint],
		share: 35,
	},
	{
		value: [SoldierBlueprint, DragonBlueprint, PriestBlueprint, BersekerBlueprint, ChoupissonBlueprint, FoxBlueprint],
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
