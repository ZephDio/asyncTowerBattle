import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../traits/render/drawable";
import { TRenderable } from "../traits/render/renderable";
import { ScreenPosition } from "../position";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { HudElementResources } from "../../renderer/resources/hud-element.resources";
import { IconResources } from "../../renderer/resources/icons.resources";
import { DrawPriority } from "../traits/render/image-drawable";
import { Rarity } from "../traits/engine/rarity";
import { ArmyBuffPercent } from "../../engine/army/battle/army-buff";

// The source scroll's borders, in its own pixels: the top and bottom rolls and the curled sides. They keep their
// shape when the scroll is stretched to the panel's size; only the parchment between them stretches.
const SLICE = { top: 165, bottom: 150, left: 80, right: 80 };
// Screen units per source pixel for those borders: a bit bigger than the item descriptor's scroll.
const BORDER_SCALE = 0.042;

const INK = "#000000";
const ALLIED = "#1d5fd1";
const ENEMY = "#c62828";

// Font sizes and spacing, in screen units (a hundredth of the canvas width).
const TITLE_SIZE = 1.7;
const TEXT_SIZE = 1.45;
const LINE = 1.3; // line height, in font sizes
const ICON = 2.4;

// Images that a paragraph can show inline, written {name} in its text, for icons the icon font doesn't have.
const INLINE_ICONS: Record<string, HTMLImageElement> = {
	"grey-bow": HudElementResources.targetBowInactive.image,
	"red-bow": HudElementResources.targetBowActive.image,
};
const INLINE_ICON = /\{([a-z-]+)\}/;
// An inline icon is as wide as this many font sizes.
const INLINE_ICON_WIDTH = 1.25;

type Legend = { icon: HTMLImageElement | string; label: string };

const unitLegend: Legend[] = [
	{ icon: IconResources.vitality.image, label: "Unit's health" },
	{ icon: IconResources.castleDamage.image, label: "Unit's damage to castle" },
	{ icon: IconResources.movespeed.image, label: "Unit's move speed" },
	{ icon: "⏱", label: "Unit's recruiting time" },
];
const towerLegend: Legend[] = [
	{ icon: IconResources.attack.image, label: "Tower's damage" },
	{ icon: IconResources.towerCastSpeed.image, label: "Tower's cast speed" },
];
// Filled row by row, two per row: the unit buffs end up in the left column and the tower buffs in the right one.
const buffLegend: Legend[] = [
	{ icon: IconResources.armyBuffVitality.image, label: `Units' health +${ArmyBuffPercent.vitality}%` },
	{ icon: IconResources.armyBuffAttack.image, label: `Towers' damage +${ArmyBuffPercent["projectile-damage"]}%` },
	{ icon: IconResources.armyBuffMovespeed.image, label: `Units' move speed +${ArmyBuffPercent["movement-speed"]}%` },
	{ icon: IconResources.armyBuffTowerCastSpeed.image, label: `Towers' cast speed +${ArmyBuffPercent["cast-speed"]}%` },
];

// The tutorial: a parchment over almost the whole canvas summing the game up for a new player. The page's "?"
// button opens it while it is hovered (the open-tutorial and close-tutorial intents), in every phase.
// Left column: the goal, the round, the battle and the resources. Right column: the icons of the descriptors.
export class TutorialPanelHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.Menu + 3;
	position = PercentToReal({ x: 50, y: 50 });
	// Almost the whole canvas, which is 100 x 61.25 screen units.
	width = 96;
	height = 58;
	title = "Build defense and offense, to protect your castle and destroy your opponent !";

	// Canvas pixels per screen unit, set at each draw.
	private unit = 1;

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number) {
		this.unit = this.getCanvasSize(context, 1, 0, scale).width;
		const u = this.unit;
		const center = this.getCanvasPosition(context, position);
		const left = center.x - (this.width * u) / 2;
		const top = center.y - (this.height * u) / 2;
		this.drawParchment(context, left, top, this.width * u, this.height * u, BORDER_SCALE * u);

		context.save();
		context.textAlign = "left";
		context.textBaseline = "top";
		context.fillStyle = INK;
		const firstLine = top + SLICE.top * BORDER_SCALE * u * 0.95;
		this.drawLeftColumn(context, left + 5.4 * u, firstLine, 41 * u);
		this.drawRightColumn(context, left + 50 * u, firstLine, 42 * u);
		context.restore();
	}

	private drawLeftColumn(context: CanvasRenderingContext2D, x: number, y: number, width: number) {
		const u = this.unit;
		y = this.paragraph(context, this.title, x, y, width, TITLE_SIZE, "title") + 1.2 * u;
		y = this.paragraph(context, "Buy monuments and units in the shop to build your army.", x, y, width) + 0.9 * u;

		// Click [START] when ready.
		const start = HudElementResources.startBattle.image;
		const startHeight = 2.4 * u;
		const startWidth = (startHeight * 224) / 96;
		context.font = `${TEXT_SIZE * u}px text`;
		const lineMiddle = y + startHeight / 2 - (TEXT_SIZE * u) / 2;
		context.fillText("Click", x, lineMiddle);
		const startX = x + context.measureText("Click ").width;
		this.drawPicture(context, start, startX, y, startWidth, startHeight);
		context.fillText("when ready.", startX + startWidth + 0.5 * u, lineMiddle);
		y += startHeight + 1.2 * u;

		// The battle schema, with its explanation beside it.
		const schemaHeight = 21.5 * u;
		const schemaWidth = (schemaHeight * 567) / 848;
		this.drawBattleSchema(context, x, y, schemaWidth, schemaHeight);
		const textX = x + schemaWidth + 1.6 * u;
		const textWidth = width - schemaWidth - 1.6 * u;
		let textY = y + 1.5 * u;
		context.fillStyle = ALLIED;
		textY = this.paragraph(context, "Your units walk up the opponent's path to their castle.", textX, textY, textWidth);
		context.fillStyle = ENEMY;
		textY = this.paragraph(context, "Theirs walk down yours.", textX, textY + 0.6 * u, textWidth);
		context.fillStyle = INK;
		this.paragraph(
			context,
			"Towers shoot the enemy units on their path. The first to destroy the other castle wins!",
			textX,
			textY + 0.6 * u,
			textWidth,
		);
		y += schemaHeight + 1.2 * u;

		y = this.iconParagraph(
			context,
			IconResources.heartContainer.image,
			"You have 5 lives: each lost battle costs one.",
			x,
			y,
			width,
		);
		y = this.iconParagraph(
			context,
			IconResources.food.image,
			"Food 🌽 feeds your units and towers. At 0, you are in trouble!",
			x,
			y + 0.6 * u,
			width,
		);
		this.iconParagraph(
			context,
			IconResources.patternStar.image,
			"Build strong synergies ▣ to overcome your opponents.",
			x,
			y + 0.6 * u,
			width,
		);
	}

	private drawRightColumn(context: CanvasRenderingContext2D, x: number, y: number, width: number) {
		const u = this.unit;
		y = this.legendGrid(context, unitLegend, x, y, width) + 1.6 * u;
		y = this.legendGrid(context, towerLegend, x, y, width) + 1.6 * u;
		context.font = `${TITLE_SIZE * u}px title`;
		context.fillText("Army's general buffs, per stack:", x, y);
		y += TITLE_SIZE * LINE * u + 0.6 * u;
		y = this.legendGrid(context, buffLegend, x, y, width) + 1.6 * u;
		// How the synergy stars of the shop work (ArmyGrid.setSynergiesTiles, drawn while a piece is hovered or held).
		context.font = `${TITLE_SIZE * u}px title`;
		context.fillText("Synergy ▣:", x, y);
		y += TITLE_SIZE * LINE * u + 0.6 * u;
		y =
			this.paragraph(
				context,
				"Hover a piece to see its stars ☆. Fill them with the right pieces ▣ to gain some effects.",
				x,
				y,
				width,
			) +
			1 * u;
		y += 0.6 * u;
		// The bows the shop draws on a tower's target cells (ArmyGrid.addTargetTiles): red over a path tile, grey elsewhere.
		this.headingWithIcon(context, "Tower's reach", HudElementResources.targetBowActive.image, x, y);
		y += TITLE_SIZE * LINE * u + 0.6 * u;
		y =
			this.paragraph(
				context,
				"Hover a tower to see its bows {grey-bow}. Put them on the path {red-bow} so it can reach the enemies.",
				x,
				y,
				width,
			) +
			1.6 * u;
		// Fury (Furry, BattleArmy.addFurryBuff): from 20 s it grows every 2 s by 1, 2, 3...; spawned units get it as %.
		this.headingWithIcon(context, "Fury", IconResources.furry.image, x, y);
		y += TITLE_SIZE * LINE * u + 0.6 * u;
		this.paragraph(
			context,
			"After 20 s, fury grows faster and faster. New units spawn with +fury% 💚 and 🥾.",
			x,
			y,
			width,
		);
	}

	// A section title followed by an icon the size of its letters.
	private headingWithIcon(
		context: CanvasRenderingContext2D,
		text: string,
		icon: HTMLImageElement,
		x: number,
		y: number,
	) {
		const size = TITLE_SIZE * this.unit;
		context.font = `${size}px title`;
		context.fillText(`${text} `, x, y);
		this.drawPicture(context, icon, x + context.measureText(`${text} `).width, y - size * 0.1, size * 1.2, size * 1.2);
		context.fillText(":", x + context.measureText(`${text} `).width + size * 1.3, y);
	}

	// Two legend entries per row: an icon and its meaning. Returns the y below the grid.
	private legendGrid(context: CanvasRenderingContext2D, entries: Legend[], x: number, y: number, width: number) {
		const u = this.unit;
		const rowHeight = ICON * u + 1 * u;
		entries.forEach(({ icon, label }, index) => {
			const entryX = x + (index % 2) * (width / 2);
			const entryY = y + Math.floor(index / 2) * rowHeight;
			if (typeof icon === "string") {
				context.font = `${ICON * u * 0.85}px text`;
				context.fillText(icon, entryX, entryY + ICON * u * 0.1);
			} else {
				this.drawPicture(context, icon, entryX, entryY, ICON * u, ICON * u);
			}
			context.font = `${TEXT_SIZE * u}px text`;
			context.fillText(
				label,
				entryX + ICON * u + 0.8 * u,
				entryY + (ICON * u - TEXT_SIZE * u) / 2,
				width / 2 - ICON * u - 1.4 * u,
			);
		});
		return y + Math.ceil(entries.length / 2) * rowHeight - 1 * u;
	}

	// A screenshot of a battle: the opponent's board on top, yours below, and arrows for where each side's units walk.
	private drawBattleSchema(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
		const u = this.unit;
		this.drawPicture(context, HudElementResources.tutorialBattle.image, x, y, width, height);
		context.strokeStyle = INK;
		context.lineWidth = Math.max(1, 0.15 * u);
		context.strokeRect(x, y, width, height);
		// The paths run along the board's sides, 6.5% of its width in.
		this.arrow(context, x + width * 0.065, y + height * 0.44, x + width * 0.065, y + height * 0.12, ALLIED);
		this.arrow(context, x + width * 0.935, y + height * 0.56, x + width * 0.935, y + height * 0.88, ENEMY);
		this.label(context, "OPPONENT", x + width / 2, y + height * 0.22);
		this.label(context, "YOU", x + width / 2, y + height * 0.78);
	}

	private label(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
		const u = this.unit;
		context.save();
		context.font = `${TITLE_SIZE * u}px title`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.lineWidth = 0.35 * u;
		context.strokeStyle = "#f3e2c0";
		context.lineJoin = "round";
		context.strokeText(text, x, y);
		context.fillStyle = INK;
		context.fillText(text, x, y);
		context.restore();
	}

	private arrow(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
		const u = this.unit;
		const angle = Math.atan2(y2 - y1, x2 - x1);
		const head = 1.1 * u;
		context.save();
		context.lineCap = "round";
		context.lineJoin = "round";
		// An ink outline under the colored arrow, like the game's sprites.
		for (const [stroke, width] of [
			[INK, 0.75 * u],
			[color, 0.4 * u],
		] as const) {
			context.strokeStyle = stroke;
			context.lineWidth = width;
			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x2, y2);
			context.moveTo(x2 - head * Math.cos(angle - 0.6), y2 - head * Math.sin(angle - 0.6));
			context.lineTo(x2, y2);
			context.lineTo(x2 - head * Math.cos(angle + 0.6), y2 - head * Math.sin(angle + 0.6));
			context.stroke();
		}
		context.restore();
	}

	// A big icon with a paragraph beside it. Returns the y below both.
	private iconParagraph(
		context: CanvasRenderingContext2D,
		icon: HTMLImageElement,
		text: string,
		x: number,
		y: number,
		width: number,
	) {
		const u = this.unit;
		this.drawPicture(context, icon, x, y, ICON * u, ICON * u);
		const bottom = this.paragraph(context, text, x + ICON * u + 1 * u, y + 0.3 * u, width - ICON * u - 1 * u);
		return Math.max(bottom, y + ICON * u);
	}

	// Wrapped text from its top left corner. Returns the y below its last line.
	private paragraph(
		context: CanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		width: number,
		size = TEXT_SIZE,
		font: "text" | "title" = "text",
	) {
		const height = size * this.unit;
		context.font = `${height}px ${font}`;
		const lines = wrapText(context, text, width);
		lines.forEach((line, index) => this.drawTextLine(context, line, x, y + index * height * LINE, height));
		return y + lines.length * height * LINE;
	}

	// One line of text whose {name} parts are drawn as INLINE_ICONS.
	private drawTextLine(context: CanvasRenderingContext2D, line: string, x: number, y: number, fontSize: number) {
		// split with a capture group alternates text and icon names.
		line.split(INLINE_ICON).forEach((part, index) => {
			if (index % 2 === 0) {
				context.fillText(part, x, y);
				x += context.measureText(part).width;
				return;
			}
			const icon = INLINE_ICONS[part];
			// The bow sprites have a transparent margin: draw them a bit bigger than the letters so they match the font icons.
			if (icon) this.drawPicture(context, icon, x - fontSize * 0.1, y - fontSize * 0.3, fontSize * 1.5, fontSize * 1.5);
			x += fontSize * INLINE_ICON_WIDTH;
		});
	}

	private drawPicture(
		context: CanvasRenderingContext2D,
		image: HTMLImageElement,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		if (image.complete && image.naturalWidth) context.drawImage(image, x, y, width, height);
	}

	// Nine-slice drawing of the descriptor's scroll, so the panel keeps its rolls at any size.
	private drawParchment(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		border: number,
	) {
		const image = HudElementResources.descriptorBanner[Rarity.Common].image;
		if (!image.complete || !image.naturalWidth) return;
		const source = { width: image.naturalWidth, height: image.naturalHeight };
		const sourceColumns = [0, SLICE.left, source.width - SLICE.right, source.width];
		const sourceRows = [0, SLICE.top, source.height - SLICE.bottom, source.height];
		const columns = [x, x + SLICE.left * border, x + width - SLICE.right * border, x + width];
		const rows = [y, y + SLICE.top * border, y + height - SLICE.bottom * border, y + height];
		for (let row = 0; row < 3; row++) {
			for (let column = 0; column < 3; column++) {
				const sx = sourceColumns[column] as number;
				const sy = sourceRows[row] as number;
				const dx = columns[column] as number;
				const dy = rows[row] as number;
				context.drawImage(
					image,
					sx,
					sy,
					(sourceColumns[column + 1] as number) - sx,
					(sourceRows[row + 1] as number) - sy,
					dx,
					dy,
					(columns[column + 1] as number) - dx,
					(rows[row + 1] as number) - dy,
				);
			}
		}
	}
}

// Splits text into lines no wider than maxWidth in the context's current font.
function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
	const lines: string[] = [];
	let line = "";
	for (const word of text.split(" ")) {
		const candidate = line ? `${line} ${word}` : word;
		if (line && measureLine(context, candidate) > maxWidth) {
			lines.push(line);
			line = word;
		} else {
			line = candidate;
		}
	}
	if (line) lines.push(line);
	return lines;
}

// The width of a line, counting its {name} inline icons.
function measureLine(context: CanvasRenderingContext2D, line: string) {
	const fontSize = Number.parseFloat(context.font);
	return line
		.split(INLINE_ICON)
		.reduce(
			(width, part, index) =>
				width + (index % 2 === 0 ? context.measureText(part).width : fontSize * INLINE_ICON_WIDTH),
			0,
		);
}
