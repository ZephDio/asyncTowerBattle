import { ImplementsTrait } from "@ddd-ts/traits";
import { Cell } from "../../../shared/position";
import { Random } from "../../../shared/random";
import { AnyBarrackBlueprint } from "../../barrack/blueprint/barrack";
import { BasicBarrackBlueprint } from "../../barrack/blueprint/implementation/basic-barrack";
import { WaveBarrackBlueprint } from "../../barrack/blueprint/implementation/wave-barrack";
import { BasicTileBlueprint } from "../../tile/blueprint/implementation/basic-path-blueprint";
import { SlowingTileBlueprint } from "../../tile/blueprint/implementation/slowing-tile-blueprint";
import { AnyPathTileBlueprint } from "../../tile/blueprint/tile";
import { BlueTowerBlueprint } from "../../tower/blueprint/implementation/blue-tower";
import { GreenTowerBlueprint } from "../../tower/blueprint/implementation/green-tower";
import { OrangeTowerBlueprint } from "../../tower/blueprint/implementation/orange-tower";
import { YellowTowerBlueprint } from "../../tower/blueprint/implementation/yellow-tower";
import { AnyTowerBlueprint } from "../../tower/blueprint/tower";
import { DragonBlueprint } from "../../units/blueprint/implementation/dragon";
import { PriestBlueprint } from "../../units/blueprint/implementation/priest";
import { SoldierBlueprint } from "../../units/blueprint/implementation/soldier";
import { AnyUnitBlueprint } from "../../units/blueprint/units";
import { TRecruit } from "../../../shared/traits/recruit";
import { ZappingTowerBlueprint } from "../../tower/blueprint/implementation/zapping-tower";
import { FrostTowerBlueprint } from "../../tower/blueprint/implementation/frost-tower";
import { BersekerBlueprint } from "../../units/blueprint/implementation/berseker";
import { ChoupissonBlueprint } from "../../units/blueprint/implementation/choupisson";

export type Constructor<C> = { new (...args: any[]): C };
type AnyBlueprint = AnyTowerBlueprint | AnyPathTileBlueprint | AnyUnitBlueprint | AnyBarrackBlueprint;
// TODO trait blueprint
const pool = [
	{
		value: [
			ZappingTowerBlueprint,
			YellowTowerBlueprint,
			BlueTowerBlueprint,
			OrangeTowerBlueprint,
			GreenTowerBlueprint,
			FrostTowerBlueprint,
		] as any,
		share: 100,
	},
	{
		value: [BasicBarrackBlueprint, WaveBarrackBlueprint] as any,
		share: 60,
	},
	{
		value: [BasicTileBlueprint, SlowingTileBlueprint] as any,
		share: 35,
	},
	{
		value: [SoldierBlueprint, DragonBlueprint, PriestBlueprint, BersekerBlueprint, ChoupissonBlueprint] as any,
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
		const recruitPool = Random.roll(pool) as Constructor<AnyBlueprint>[];
		const outComes = recruitPool.map((blueprint) => {
			const item = new blueprint({});
			return { value: item, share: item.probabilityShare };
		});
		const bluePrint = Random.roll(outComes);
		return bluePrint;
	}
}
