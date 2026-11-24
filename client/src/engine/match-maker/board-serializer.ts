import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { DwarfCastleBlueprint } from "../castle/blueprint/dwarf-castle-blueprint";
import { ElfCastleBlueprint } from "../castle/blueprint/elf-castle-blueprint";
import { AnyCastle } from "../castle/recruit/castle-recruit";
import { DwarfCastle } from "../castle/recruit/implem/dwarf-castle";
import { ElfCastle } from "../castle/recruit/implem/elf-castle";
import { AnyBarrack } from "../constructs/barrack/recruit/barrack";
import { BasicBarrack } from "../constructs/barrack/recruit/implementation/basic-barrack";
import { VeterantBarrack } from "../constructs/barrack/recruit/implementation/veterant-barrack";
import { WaveBarrack } from "../constructs/barrack/recruit/implementation/wave-barrack";
import { RushBarrack } from "../constructs/barrack/recruit/implementation/rush-barrack";
import { AnvilTotem } from "../constructs/totem/recruit/implementation/anvil";
import { Bakery } from "../constructs/totem/recruit/implementation/backery";
import { Bosquet } from "../constructs/totem/recruit/implementation/bosquet";
import { Brewery } from "../constructs/totem/recruit/implementation/brewery";
import { CropsField } from "../constructs/totem/recruit/implementation/crops-field";
import { GobelinPortal } from "../constructs/totem/recruit/implementation/gobelin-portal";
import { Mine } from "../constructs/totem/recruit/implementation/mine";
import { RedObelisk } from "../constructs/totem/recruit/implementation/obelisk";
import { PowderMagazine } from "../constructs/totem/recruit/implementation/powder-magazine";
import { Windmill } from "../constructs/totem/recruit/implementation/windmill";
import { AnyTotem } from "../constructs/totem/recruit/totem";
import { BlacksmithTower } from "../constructs/tower/recruit/implementation/blacksmith-tower";
import { DrillTower } from "../constructs/tower/recruit/implementation/drill-tower";
import { Lighthouse } from "../constructs/tower/recruit/implementation/lighthouse";
import { FrostTower } from "../constructs/tower/recruit/implementation/frost-tower";
import { WindmillTurret } from "../constructs/tower/recruit/implementation/windmill-turret";
import { WitchHouse } from "../constructs/tower/recruit/implementation/witch-house";
import { ZappingTower } from "../constructs/tower/recruit/implementation/zapping-tower";
import { AnyTower } from "../constructs/tower/recruit/tower";
import { Forest } from "../environment/forest";
import { Rock } from "../environment/rock";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { AnyPathTile } from "../tile/recruit/tile";
import { SlowingTrap } from "../trap/recruit/implementation/slowing-trap";
import { StunTrap } from "../trap/recruit/implementation/stun-trap";
import { AnyTrap } from "../trap/recruit/trap";
import { DwarfBlueprint } from "../units/blueprint/implementation/dwarf-blueprint";
import { ElfBlueprint } from "../units/blueprint/implementation/elf-blueprint";
import { Brewmaster } from "../units/recruit/implementation/brewmaster";
import { Choupisson } from "../units/recruit/implementation/choupisson";
import { Dragon } from "../units/recruit/implementation/dragon";
import { Ent } from "../units/recruit/implementation/ent";
import { Fox } from "../units/recruit/implementation/fox";
import { GoGoat } from "../units/recruit/implementation/go-goat";
import { ParadiseBird } from "../units/recruit/implementation/paradise-bird";
import { WhiteStag } from "../units/recruit/implementation/white-stag";
import { AnyUnit } from "../units/recruit/unit";
import { AnyRecruit } from "../../shared/traits/engine/recruit";
import { Opponent } from "./match-maker";
import {
	SerializedBarrackType,
	SerializedBoard,
	SerializedCell,
	SerializedElement,
	SerializedEnvironmentType,
	SerializedFaction,
	SerializedInventoryItem,
	SerializedTotemType,
	SerializedTowerType,
	SerializedTrapType,
	SerializedUnitType,
} from "./serialized-board";

type Constructor<T> = new (cell: Cell) => T;

const towers: Record<SerializedTowerType, Constructor<AnyTower>> = {
	blacksmith: BlacksmithTower,
	drill: DrillTower,
	frost: FrostTower,
	lighthouse: Lighthouse,
	"windmill-turret": WindmillTurret,
	"witch-house": WitchHouse,
	zapping: ZappingTower,
};

const totems: Record<SerializedTotemType, Constructor<AnyTotem>> = {
	anvil: AnvilTotem,
	bakery: Bakery,
	bosquet: Bosquet,
	brewery: Brewery,
	"crops-field": CropsField,
	"gobelin-portal": GobelinPortal,
	mine: Mine,
	"red-obelisk": RedObelisk,
	"powder-magazine": PowderMagazine,
	windmill: Windmill,
};

const barracks: Record<SerializedBarrackType, Constructor<AnyBarrack>> = {
	basic: BasicBarrack,
	rush: RushBarrack,
	veterant: VeterantBarrack,
	wave: WaveBarrack,
};

const units: Record<SerializedUnitType, Constructor<AnyUnit>> = {
	brewmaster: Brewmaster,
	choupisson: Choupisson,
	dragon: Dragon,
	ent: Ent,
	fox: Fox,
	"go-goat": GoGoat,
	"paradise-bird": ParadiseBird,
	"white-stag": WhiteStag,
};

const traps: Record<SerializedTrapType, Constructor<AnyTrap>> = {
	slowing: SlowingTrap,
	stun: StunTrap,
};

const environment: Record<SerializedEnvironmentType, Constructor<Rock | Forest>> = {
	forest: Forest,
	rock: Rock,
};

const factions: Record<
	SerializedFaction,
	{ castle: (cell: Cell) => AnyCastle; defaultUnit: () => Army["defaultUnit"] }
> = {
	Dwarf: {
		castle: (cell) => new DwarfCastle(new DwarfCastleBlueprint({}), cell),
		defaultUnit: () => new DwarfBlueprint({}),
	},
	Elf: { castle: (cell) => new ElfCastle(new ElfCastleBlueprint({}), cell), defaultUnit: () => new ElfBlueprint({}) },
};

// The key of the registry entry whose class built `element`.
const typeOf = <K extends string, T>(registry: Record<K, Constructor<T>>, element: object): K => {
	const entry = Object.entries<Constructor<T>>(registry).find(([, constructor]) => element instanceof constructor);
	if (!entry) throw new Error(`No serialized type for ${element.constructor.name}`);
	return entry[0] as K;
};

const toCell = ({ x, y }: SerializedCell) => new Cell({ x, y });
const fromCell = ({ x, y }: Cell): SerializedCell => ({ x, y });

const serializePathTile = (tile: AnyPathTile): Extract<SerializedElement, { kind: "path" }> => ({
	kind: "path",
	cell: fromCell(tile.cell),
	trap: tile.trap ? typeOf(traps, tile.trap) : null,
	connectionChoice: tile.connectionChoice?.map(fromCell) ?? null,
});

export const serializeBoard = (army: Army, round: number, randomSeed: number): SerializedBoard => {
	const { grid } = army;
	const castle = army.castle;
	const faction: SerializedFaction = castle instanceof DwarfCastle ? "Dwarf" : "Elf";
	const elements: SerializedElement[] = [
		{ kind: "castle", cell: fromCell(castle.cell) },
		...army.towers.map(
			(tower): SerializedElement => ({
				kind: "tower",
				type: typeOf(towers, tower),
				cell: fromCell(tower.cell),
			}),
		),
		...army.totems.map(
			(totem): SerializedElement => ({
				kind: "totem",
				type: typeOf(totems, totem),
				cell: fromCell(totem.cell),
			}),
		),
		...army.barracks.map(
			(barrack): SerializedElement => ({
				kind: "barrack",
				type: typeOf(barracks, barrack),
				cell: fromCell(barrack.cell),
				unit: barrack.unitRecruit ? typeOf(units, barrack.unitRecruit) : null,
			}),
		),
		...army.pathTiles.map(serializePathTile),
		...army.environment.map(
			(element): SerializedElement => ({
				kind: "environment",
				type: typeOf(environment, element),
				cell: fromCell(element.cell),
			}),
		),
	];
	return { round, faction, size: { width: grid.width, height: grid.height }, randomSeed, elements };
};

const deserializeElement = (element: SerializedElement, faction: SerializedFaction) => {
	const cell = toCell(element.cell);
	switch (element.kind) {
		case "castle":
			return factions[faction].castle(cell);
		case "tower":
			return new towers[element.type](cell);
		case "totem":
			return new totems[element.type](cell);
		case "barrack": {
			const barrack = new barracks[element.type](cell);
			if (element.unit) barrack.setUnit(new units[element.unit](new Cell({ x: 0, y: 0 })));
			return barrack;
		}
		case "path": {
			const tile = new BasicPathTile(cell);
			if (element.trap) tile.attachTrap(new traps[element.trap](cell.clone()));
			tile.connectionChoice = element.connectionChoice?.map(toCell) ?? null;
			return tile;
		}
		case "environment":
			return new environment[element.type](cell);
	}
};

export const deserializeBoard = (board: SerializedBoard): Omit<Opponent, "playerName"> => {
	const grid = ArmyGrid.sized(board.size);
	board.elements.forEach((element) => grid.setElement(deserializeElement(element, board.faction)));
	// Boards stored before the castle left the grid end their path one cell lower, under the castle that stood on the top
	// left cell. That cell now carries the last tile of the path, which leaves the board into the castle.
	const entryCell = grid.getCastleEntryCell();
	if (!grid.getElement(entryCell)) grid.setElement(new BasicPathTile(entryCell));
	const army = new Army(grid, new Inventory(), factions[board.faction].defaultUnit());
	return { army, randomSeed: board.randomSeed };
};

const instanceOfAny = <T>(registry: Record<string, Constructor<T>>, element: object) =>
	Object.values(registry).some((constructor) => element instanceof constructor);

// A piece of the reserve in its serialized form, with its cell in the reserve.
export const serializeInventoryItem = (recruit: AnyRecruit): SerializedInventoryItem => {
	const cell = fromCell(recruit.cell);
	if (instanceOfAny(towers, recruit)) return { kind: "tower", type: typeOf(towers, recruit), cell };
	if (instanceOfAny(totems, recruit)) return { kind: "totem", type: typeOf(totems, recruit), cell };
	if (instanceOfAny(barracks, recruit)) {
		const barrack = recruit as AnyBarrack;
		return {
			kind: "barrack",
			type: typeOf(barracks, barrack),
			cell,
			unit: barrack.unitRecruit ? typeOf(units, barrack.unitRecruit) : null,
		};
	}
	if (instanceOfAny(traps, recruit)) return { kind: "trap", type: typeOf(traps, recruit), cell };
	if (instanceOfAny(units, recruit)) return { kind: "unit", type: typeOf(units, recruit), cell };
	if (recruit instanceof BasicPathTile) return serializePathTile(recruit);
	throw new Error(`No serialized form for ${recruit.constructor.name} in the inventory`);
};

export const deserializeInventoryItem = (item: SerializedInventoryItem): AnyRecruit => {
	switch (item.kind) {
		case "trap":
			return new traps[item.type](toCell(item.cell));
		case "unit":
			return new units[item.type](toCell(item.cell));
		default:
			// Never a castle or an environment piece, which the reserve doesn't hold. The faction only picks a castle.
			return deserializeElement(item, "Dwarf") as AnyRecruit;
	}
};
