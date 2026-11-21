// Debug bridge for the game MCP server (.agents/mcp/server.py). Opening the game with `?debug` in the URL installs
// `window.__atb`: a small API that reads the game as plain JSON, gives page pixels for cells and HUD elements so the
// server can send real mouse events, and steps battles tick by tick. Every return value must survive JSON.
import { implementsTrait } from "@ddd-ts/traits";
import { GameWrapper } from "../engine/wrap";
import { CanvasRenderer, proportion } from "../renderer/implementation/canvas-renderer";
import { Cell, GridPosition, ScreenPosition } from "../shared/position";
import { STANDARD_CELL_SIZE, TGrid } from "../engine/grid/tgrid";
import { ImplementsTrait } from "@ddd-ts/traits";
import { GridElement } from "../shared/traits/engine/core/grid-element";
import { TDescriptor } from "../shared/traits/render/huds/item-descriptor";
import { Tagged } from "../shared/traits/engine/tags/tagged";
import { rarityOf } from "../shared/traits/engine/rarity";
import { Stats } from "../engine/stats/stats";
import { PathTile } from "../engine/tile/recruit/tile";
import { Castle } from "../engine/castle/recruit/castle-recruit";
import { Buyable } from "../engine/shop/retail/buyable";
import { Faction } from "../engine/menu/main-menu";
import { RetailFiller } from "../engine/shop/retail/retail-filler";
import { TRecruit } from "../shared/traits/engine/recruit";
import { Unit } from "../engine/units/recruit/unit";
import { BattleArmy } from "../engine/army/battle/battle-army";

type AnyGrid = ImplementsTrait<typeof TGrid>;
type AnyGridElement = ImplementsTrait<typeof GridElement>;
type GridName = "army" | "inventory" | "retail" | "battle";
type Rect = { x: number; y: number; width: number; height: number };

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export class DebugBridge {
	// Stable ids for the objects the bridge hands out, so `inspect` and the actions can point at them.
	private ids = new WeakMap<object, string>();
	private objects = new Map<string, object>();
	private counter = 0;

	constructor(
		public wrap: GameWrapper,
		public renderer: CanvasRenderer,
	) {}

	get game() {
		return this.wrap.game;
	}

	phase(): "menu" | "shop" | "battle" | "summary" {
		const game = this.wrap.state === "game" ? this.game : null;
		if (!game) return "menu";
		if (game.battle) return "battle";
		if (game.battleSummary) return "summary";
		return "shop";
	}

	idOf(object: object) {
		let id = this.ids.get(object);
		if (!id) {
			id = `${object.constructor.name}#${++this.counter}`;
			this.ids.set(object, id);
			this.objects.set(id, object);
		}
		return id;
	}

	byId(id: string) {
		const object = this.objects.get(id);
		if (!object) throw new Error(`Unknown id ${id}`);
		return object;
	}

	// --- Screen geometry -------------------------------------------------------------------------------------------

	// Inverse of MouseEventHandler.pixelPositionToRelative: a game screen position to a page pixel.
	screenToPage(position: { x: number; y: number }) {
		const origin = this.renderer.pageOrigin();
		const { width, height } = this.renderer.canvas;
		return {
			x: round(origin.x + (position.x * width) / 100, 1),
			y: round(origin.y + ((100 - position.y * proportion) * height) / 100, 1),
		};
	}

	cellCenterPage(grid: AnyGrid, cell: Cell) {
		return this.screenToPage(grid.gridToScreenPosition(grid.cellToGrid(cell)));
	}

	gridPositionPage(grid: AnyGrid, position: GridPosition) {
		return this.screenToPage(grid.gridToScreenPosition(position));
	}

	gridRect(grid: AnyGrid): Rect {
		const corner = grid.position;
		const topLeft = this.screenToPage({ x: corner.x, y: corner.y + grid.height * grid.cellSize });
		const bottomRight = this.screenToPage({ x: corner.x + grid.width * grid.cellSize, y: corner.y });
		return { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y };
	}

	grid(name: GridName): AnyGrid {
		const game = this.game;
		if (!game) throw new Error("No game running");
		if (name === "army") return game.army.grid;
		if (name === "inventory") return game.army.inventory;
		if (name === "retail") {
			if (!game.shop) throw new Error("Not in the shop");
			return game.shop.retail.grid;
		}
		const battle = game.battle ?? game.battleSummary?.battle;
		if (!battle) throw new Error("No battle");
		return battle.battlefield.grid;
	}

	canvasRect(): Rect {
		const origin = this.renderer.pageOrigin();
		const { width, height } = this.renderer.canvas;
		return { x: origin.x, y: origin.y, width, height };
	}

	// Page rectangles to crop screenshots on.
	regions() {
		const regions: Record<string, Rect> = { canvas: this.canvasRect() };
		const phase = this.phase();
		if (phase === "shop") {
			regions["army"] = this.gridRect(this.grid("army"));
			regions["inventory"] = this.gridRect(this.grid("inventory"));
			regions["retail"] = this.gridRect(this.grid("retail"));
		}
		if (phase === "battle" || phase === "summary") regions["battle"] = this.gridRect(this.grid("battle"));
		return regions;
	}

	// Page pixel to press to pick up an element: the centre of its first occupied cell.
	pressPoint(gridName: GridName, id: string) {
		const grid = this.grid(gridName);
		const element = this.byId(id) as AnyGridElement;
		const cells = element.gridShape.getOccupiedCellsFrom(element.cell, element.orientation);
		const cell = cells[0];
		if (!cell) throw new Error(`${id} has no cell`);
		return this.cellCenterPage(grid, cell);
	}

	// Page pixel to release a held element on so that its anchor lands on `cell`: the centre of its footprint there.
	// TokenDrag.onRelease takes the released position minus the shape's centre offset, so this is exact.
	dropPoint(gridName: GridName, id: string, cell: { x: number; y: number }) {
		const grid = this.grid(gridName);
		const object = this.byId(id);
		const element = (object instanceof Buyable ? object.entity : object) as AnyGridElement;
		return this.gridPositionPage(grid, element.gridShape.getCenterPosition(new Cell(cell)));
	}

	hudElements() {
		const game = this.game;
		const phase = this.phase();
		let elements: object[] = [];
		if (phase === "menu") elements = this.wrap.mainMenu.getState().hudElements;
		if (phase === "shop" && game?.shop) elements = game.shop.getState().hudElements;
		if (phase === "battle" && game?.battle) elements = game.battle.getState().hudElements;
		if (phase === "summary" && game?.battleSummary) elements = game.battleSummary.getState().hudElements;
		return elements.flatMap((element) => {
			if (!("position" in element) || !(element.position instanceof ScreenPosition)) return [];
			return [{ name: element.constructor.name, ...this.screenToPage(element.position) }];
		});
	}

	// --- Reading -----------------------------------------------------------------------------------------------------

	describe(object: object) {
		const element = object instanceof Buyable ? object.entity : object;
		const result: Record<string, unknown> = {
			id: this.idOf(object),
			name: implementsTrait(element, TDescriptor) ? element.description.name : element.constructor.name,
			kind: element.constructor.name,
		};
		if (implementsTrait(element, GridElement)) {
			result["cell"] = [element.cell.x, element.cell.y];
			const cells = element.gridShape.getOccupiedCellsFrom(element.cell, element.orientation);
			if (cells.length > 1) result["cells"] = cells.map((cell) => [cell.x, cell.y]);
		}
		if (implementsTrait(element, Tagged) && element.tags.length) result["tags"] = [...element.tags];
		if (implementsTrait(element, TRecruit) || object instanceof Buyable) result["rarity"] = rarityOf(element);
		if (object instanceof Buyable) result["price"] = object.price;
		return result;
	}

	statsOf(object: object) {
		if (!("stats" in object) || !(object.stats instanceof Stats)) return undefined;
		const stats = object.stats;
		const values: Record<string, number> = {
			hp: stats.health,
			maxHp: stats.maxHealth,
			castleDamage: stats.castleDamage,
			projectileDamage: stats.projectileDamage,
			movementSpeed: stats.movementSpeed,
			castSpeed: stats.castSpeed,
			attackSpeed: stats.attackSpeed,
			foodCost: stats.foodCost,
			range: stats.range,
		};
		// Blueprints use NaN for stats a piece doesn't have, e.g. a castle's attack.
		const result: Record<string, unknown> = Object.fromEntries(
			Object.entries(values).flatMap(([key, value]) => (Number.isFinite(value) ? [[key, round(value)]] : [])),
		);
		result["conditions"] = [...stats.conditions.keys()];
		result["boons"] = [...stats.boons.keys()];
		return result;
	}

	uniqueElements(grid: AnyGrid) {
		return [...new Set(grid.getElements())];
	}

	state() {
		const phase = this.phase();
		const game = this.game;
		const tutorial = this.wrap.tutorial !== null;
		if (!game) return { phase, tutorial, faction: this.wrap.mainMenu.classesSelectorHud.selectedClass };
		const base = { phase, tutorial, round: game.rounds.round, life: game.life };
		if (phase === "shop" && game.shop) {
			const shop = game.shop;
			const army = game.army;
			return {
				...base,
				gold: army.getEconomyHooks().getEconomy().amount,
				pathComplete: army.pathNetwork.complete,
				holding: shop.holderControl.hold ? this.describe(shop.holderControl.hold.holded) : null,
				offers: this.uniqueElements(shop.retail.grid).map((offer) => this.describe(offer)),
				army: this.uniqueElements(army.grid)
					.filter((element) => !army.environment.includes(element as never) && !implementsTrait(element, PathTile))
					.map((element) => this.describe(element)),
				pathTiles: army.pathTiles.map((tile) => [tile.cell.x, tile.cell.y]),
				inventory: this.uniqueElements(army.inventory).map((element) => this.describe(element)),
			};
		}
		const battle = game.battle ?? game.battleSummary?.battle;
		if (!battle) return base;
		const field = battle.battlefield;
		const side = (army: BattleArmy, name: "allied" | "enemy") => ({
			castle: { id: this.idOf(army.castle), ...this.statsOf(army.castle) },
			food: round(army.foodEconomy.food),
			maxFood: round(army.foodEconomy.maxFood),
			famine: army.foodEconomy.isFamine(),
			units: [...army.units.keys()].map((unit) => ({
				...this.describe(unit),
				pos: [
					round(unit.position.x / STANDARD_CELL_SIZE - 0.5, 1),
					round(unit.position.y / STANDARD_CELL_SIZE - 0.5, 1),
				],
				...this.pick(this.statsOf(unit), ["hp", "maxHp", "conditions", "boons"]),
			})),
			constructs: [...army.towers, ...army.barracks, ...army.totems].map((construct) => this.describe(construct)),
			side: name,
		});
		return {
			...base,
			tick: battle.timer.clock,
			started: battle.started,
			paused: battle.paused,
			over: battle.isOver,
			verdict: game.battleSummary?.verdict ?? null,
			allied: side(field.alliedArmy, "allied"),
			enemy: side(field.enemyArmy, "enemy"),
			projectiles: field.projectiles.length,
			areaEffects: field.areaEffects.length,
		};
	}

	pick(object: Record<string, unknown> | undefined, keys: string[]) {
		if (!object) return {};
		return Object.fromEntries(keys.map((key) => [key, object[key]]));
	}

	inspect(id: string) {
		const object = this.byId(id);
		const element = object instanceof Buyable ? object.entity : object;
		const fields: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(element)) {
			if (["string", "number", "boolean"].includes(typeof value)) fields[key] = value;
		}
		return {
			...this.describe(object),
			description: implementsTrait(element, TDescriptor) ? element.description : undefined,
			stats: this.statsOf(element),
			fields,
		};
	}

	// The grid as text, top row first since y points up. Path tiles are `#`, environment `^`, the castle `C`, empty
	// cells `.`, and every other piece gets a letter listed in the legend.
	ascii(gridName: GridName = "army") {
		const grid = this.grid(gridName);
		const environment: object[] = this.game && gridName === "army" ? this.game.army.environment : [];
		const legend: Record<string, string> = {};
		const letters = new Map<object, string>();
		const letterOf = (element: object) => {
			if (implementsTrait(element, PathTile)) return "#";
			if (environment.includes(element)) return "^";
			if (implementsTrait(element, Castle)) return "C";
			let letter = letters.get(element);
			if (!letter) {
				letter = String.fromCharCode(65 + (letters.size % 26) + (letters.size >= 26 ? 32 : 0));
				letters.set(element, letter);
				legend[letter] = `${this.describe(element)["name"]} (${this.idOf(element)})`;
			}
			return letter;
		};
		const rows: string[] = [];
		for (let y = grid.height - 1; y >= 0; y--) {
			let row = "";
			for (let x = 0; x < grid.width; x++) {
				const element = grid.getElement(new Cell({ x, y }));
				row += element ? letterOf(element) : ".";
			}
			rows.push(`${String(y).padStart(2)} ${row}`);
		}
		let axis = "   ";
		for (let x = 0; x < grid.width; x++) axis += x % 10;
		rows.push(axis);
		return { map: rows.join("\n"), legend };
	}

	// --- Acting ------------------------------------------------------------------------------------------------------

	async startGame(faction?: Faction) {
		if (faction) this.wrap.mainMenu.classesSelectorHud.changeClass(faction);
		this.wrap.startNewGame();
		// Retail.refresh fills the offers asynchronously.
		await new Promise((resolve) => setTimeout(resolve));
		return this.state();
	}

	catalog() {
		return new RetailFiller(1).candidates().map(({ blueprint }) => {
			const recruit = blueprint.toRecruit(new Cell({ x: 0, y: 0 }));
			return {
				name: recruit.description.name,
				kind: recruit.constructor.name,
				rarity: rarityOf(blueprint),
				price: blueprint.price,
			};
		});
	}

	// Puts a fresh piece on the army grid, or in the inventory when no cell is given.
	give(name: string, cell?: { x: number; y: number }) {
		const game = this.game;
		if (!game) throw new Error("No game running");
		const lower = name.toLowerCase();
		const candidate = new RetailFiller(1).candidates().find(({ blueprint }) => {
			const recruit = blueprint.toRecruit(new Cell({ x: 0, y: 0 }));
			return recruit.description.name.toLowerCase() === lower || recruit.constructor.name.toLowerCase() === lower;
		});
		if (!candidate) throw new Error(`No piece named ${name}, see catalog()`);
		const recruit = candidate.blueprint.toRecruit(new Cell(cell ?? { x: 0, y: 0 }));
		if (!cell || implementsTrait(recruit, Unit)) {
			game.army.pushToInventory(recruit);
			return this.describe(recruit);
		}
		const placement = game.army.grid.validateGridElementPlacement(recruit, recruit.cell);
		if (!placement.valid || placement.elements.length) {
			throw new Error(`Cannot place ${name} at ${cell.x},${cell.y}: out of the grid or over another piece`);
		}
		game.army.addRecruit(recruit, game.army.grid);
		return this.describe(recruit);
	}

	remove(id: string) {
		const game = this.game;
		if (!game) throw new Error("No game running");
		game.army.removeRecruit(this.byId(id) as never);
		return true;
	}

	setGold(amount: number) {
		const game = this.game;
		if (!game) throw new Error("No game running");
		const hooks = game.army.getEconomyHooks();
		const current = hooks.getEconomy().amount;
		if (amount > current) hooks.addGold(amount - current);
		if (amount < current) hooks.spendGold(current - amount);
		return hooks.getEconomy().amount;
	}

	// Opens or closes the tutorial panel, as hovering the page's "?" button does.
	tutorial(open = true) {
		if (open) this.wrap.openTutorial();
		else this.wrap.closeTutorial();
		return this.wrap.tutorial !== null;
	}

	setLife(life: number) {
		if (!this.game) throw new Error("No game running");
		this.game.life = life;
		return life;
	}

	// --- Battle time -------------------------------------------------------------------------------------------------

	battle() {
		const battle = this.game?.battle;
		if (!battle) throw new Error("No battle running");
		return battle;
	}

	pause(paused = true) {
		this.battle().paused = paused;
		return this.battleClock();
	}

	// Runs up to `ticks` battle ticks synchronously, stopping early when the battle ends.
	step(ticks: number) {
		const battle = this.battle();
		if (!battle.started) throw new Error("The battle has not started yet: its intro animation is still playing");
		battle.paused = true;
		for (let i = 0; i < ticks && !battle.isOver; i++) battle.tick();
		return this.battleClock(battle);
	}

	battleClock(battle = this.game?.battle ?? this.game?.battleSummary?.battle) {
		if (!battle) return null;
		return { tick: battle.timer.clock, started: battle.started, paused: battle.paused, over: battle.isOver };
	}
}

export function installDebugBridge(wrap: GameWrapper, renderer: CanvasRenderer) {
	(window as unknown as { __atb: DebugBridge }).__atb = new DebugBridge(wrap, renderer);
}
