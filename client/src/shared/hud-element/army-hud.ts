import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Army } from "../../engine/army/army";
import { DwarfCastle } from "../../engine/castle/recruit/implem/dwarf-castle";
import { HudElementResources } from "../../renderer/resources/hud-element.resources";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { ScreenPosition } from "../position";
import { TCollider } from "../traits/engine/core/TCollider";
import { THitbox } from "../traits/engine/core/THitbox";
import { TokenUnit } from "../traits/engine/token-unit";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { Description, TDescriptor } from "../traits/render/huds/item-descriptor";
import { IconResources } from "../../renderer/resources/icons.resources";
import { GoldHud } from "./gold-hud";
import { OUTLINE, TEXT, columnLayout } from "./shop-left-column";

// Sizes in screen units at full scale, below the rod: the castle life and max food rows, the "Basic unit" label
// above the slot showing the unit, then the gold purse.
const WIDTH = 9;
const PADDING = 1;
const ROW = 2.6;
const GAP = 0.6;
const LABEL = 2;
const SLOT = 4.4;
// Room kept between the unit and the purse for the life and round indicator.
const INDICATOR = 3.4;
const MAX_LIFE = 5;
const HEART = 1.6;
const PURSE = 7;
const PURSE_IMAGE = 7.5;
const SLOT_TOP = PADDING + 2 * ROW + GAP + LABEL;
const INDICATOR_TOP = SLOT_TOP + SLOT;
const PURSE_TOP = INDICATOR_TOP + INDICATOR + GAP;
const BANNER_WIDTH = 12;
const BANNER_HEIGHT = 31;
const CONTENT_TOP = 2;

const BASIC_UNIT_DESCRIPTION = new Description("Basic unit", [
	"Produced by your",
	"castle and by your",
	"empty barracks.",
	"",
	"To change the unit a",
	"barrack produces,",
	"recruit a new unit",
	"and put it inside.",
]);

// The shop's army panel left of the grid, under the castle tree: the castle's life, the army's max food, its basic
// unit (the one the castle and the barracks without a unit spawn) and the player's gold. The unit can't be picked up;
// hovering it shows its description. The panel sticks under the grid's top left corner and shrinks to fit the room
// left of the grid, which widens over the rounds.
export class ArmyHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: BANNER_WIDTH, height: BANNER_HEIGHT }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority = DrawPriority.HUD;
	position: ScreenPosition;
	scale: number;
	unit: ImplementsTrait<typeof TokenUnit>;
	private purse: GoldHud;

	constructor(
		private army: Army,
		private round: number,
		private life: number,
	) {
		super({});
		this.unit = army.defaultUnit;
		this.purse = new GoldHud(army.getEconomyHooks().getEconomy().amount);
		const { left, right, top, bottom } = columnLayout(army.grid);
		this.scale = Math.min((right - left) / BANNER_WIDTH, (top - bottom) / BANNER_HEIGHT);
		const size = { width: BANNER_WIDTH * this.scale, height: BANNER_HEIGHT * this.scale };
		this.position = new ScreenPosition({ x: (left + right) / 2, y: top - size.height / 2 });
		this.hitbox = new HitBox([[new Rectangle(size), new ScreenPosition({ x: 0, y: 0 })]]);
	}

	// Screen offset from the panel's center to the center of something `fromTop` units under its top.
	private offsetTo(fromTop: number) {
		return new ScreenPosition({ x: 0, y: (BANNER_HEIGHT / 2 - CONTENT_TOP - fromTop) * this.scale });
	}

	private overArea(point: ScreenPosition, fromTop: number, width: number, height: number) {
		const center = this.position.add(this.offsetTo(fromTop + height / 2));
		return (
			Math.abs(point.x - center.x) <= (width / 2) * this.scale && Math.abs(point.y - center.y) <= (height / 2) * this.scale
		);
	}

	// What hovering `point` describes: the unit in its slot, or the "Basic unit" label.
	describedAt(point: ScreenPosition): ImplementsTrait<typeof TDescriptor> | null {
		if (this.overArea(point, SLOT_TOP, SLOT, SLOT) && implementsTrait(this.unit, TDescriptor)) return this.unit;
		if (this.overArea(point, SLOT_TOP - LABEL, WIDTH - 2 * PADDING, LABEL)) return { description: BASIC_UNIT_DESCRIPTION };
		return null;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.save();
		context.globalAlpha = 1;
		const unit = this.getCanvasSize(context, 1, 1, this.scale).width;
		const center = this.getCanvasPosition(context, position);
		const top = this.getCanvasPosition(context, position.add(this.offsetTo(0))).y;
		const faction = this.army.castle instanceof DwarfCastle ? "Dwarf" : "Elf";
		context.imageSmoothingEnabled = false;
		this.drawImage(
			context,
			{ width: BANNER_WIDTH * unit, height: BANNER_HEIGHT * unit },
			center,
			HudElementResources.armyBanner[faction].image,
		);

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.lineJoin = "round";
		context.strokeStyle = OUTLINE;
		context.fillStyle = TEXT;
		const army = this.army;
		const rows = [`❤ ${Math.round(army.castle.maxHealth)}`, `🌽 ${Math.round(army.foodEconomy.maxFood)}`];
		rows.forEach((row, index) => {
			this.drawText(context, row, center.x, top + (PADDING + ROW * (index + 0.5)) * unit, unit * 2.2, unit);
		});
		const labelY = top + (PADDING + 2 * ROW + GAP + LABEL / 2) * unit;
		this.drawText(context, "Basic unit", center.x, labelY, unit * 1.4, unit);

		if (implementsTrait(this.unit, TDrawable)) {
			this.unit.draw(context, position.add(this.offsetTo(SLOT_TOP + SLOT / 2)), 1.35 * this.scale);
		}
		const indicatorTop = top + INDICATOR_TOP * unit;
		this.drawText(context, `Round ${this.round}`, center.x, indicatorTop + INDICATOR * 0.25 * unit, unit * 1.6, unit);
		const heartSize = HEART * unit;
		for (let index = 0; index < MAX_LIFE; index++) {
			const icon = index < this.life ? IconResources.heartContainer : IconResources.emptyHeartContainer;
			this.drawImage(
				context,
				{ width: heartSize, height: heartSize },
				{ x: center.x + (index - (MAX_LIFE - 1) / 2) * heartSize, y: indicatorTop + INDICATOR * 0.72 * unit },
				icon.image,
			);
		}
		this.purse.draw(context, position.add(this.offsetTo(PURSE_TOP + PURSE / 2)), (this.scale * PURSE) / PURSE_IMAGE);
		context.restore();
	}

	// The font's "middle" baseline sits a bit above the letters' visual center, so nudge them down.
	private drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, unit: number) {
		context.font = `${fontSize}px title`;
		context.lineWidth = unit * 0.35;
		const textY = y + fontSize * 0.08;
		context.strokeText(text, x, textY, (WIDTH - 2 * PADDING) * unit);
		context.fillText(text, x, textY, (WIDTH - 2 * PADDING) * unit);
	}
}
