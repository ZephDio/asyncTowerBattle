import { Derive } from "@ddd-ts/traits";
import type { ShopSignHud } from "./shop-sign-hud";
import { RarityOdds } from "../../engine/shop/retail/rarity-odds";
import { ScreenPosition } from "../position";
import { Rarity } from "../traits/engine/rarity";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";

// Border and fill of each rarity's badge.
const RARITY_COLORS: Record<Rarity, { border: string; fill: string }> = {
	[Rarity.Common]: { border: "#a7a39b", fill: "#4d4943" },
	[Rarity.Uncommon]: { border: "#4fc25a", fill: "#1f5a2a" },
	[Rarity.Rare]: { border: "#3d8ee8", fill: "#173f73" },
	[Rarity.Epic]: { border: "#a95ee0", fill: "#4a2068" },
	[Rarity.Legendary]: { border: "#ec4b3c", fill: "#6e1d17" },
};
const OUTLINE = "#1d1d1c";
const PANEL_FILL = "#3b2a22";
const PANEL_RIM = "#c8955a";
const TEXT = "#fff4dc";

// The shop's chance, in percent, to offer each rarity this round: a badge per rarity on a rounded wooden panel,
// beside the hovered shop sign. A rarity the shop can't offer yet is dimmed.
export class RarityOddsHud extends Derive(TDrawable, TRenderable) {
	drawPriority = DrawPriority.HUD;
	position: ScreenPosition;
	size = { width: 19, height: 7 };
	badgeSize = 2.7;
	badgeSpacing = 3.1;

	constructor(public odds: RarityOdds, sign: ShopSignHud) {
		super({});
		this.position = new ScreenPosition({
			x: sign.position.x + sign.size.width / 2 + 1.6 + this.size.width / 2,
			y: sign.position.y - 0.5,
		});
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition): void {
		context.save();
		context.globalAlpha = 1;
		const center = this.getCanvasPosition(context, position);
		const panel = this.getCanvasSize(context, this.size.width, this.size.height);
		const unit = this.getCanvasSize(context, 1, 1).width;
		const left = center.x - panel.width / 2;
		const top = center.y - panel.height / 2;

		// The panel: a thick dark outline, a wooden fill and a light rim inside the outline.
		context.beginPath();
		context.roundRect(left, top, panel.width, panel.height, panel.height / 2);
		context.fillStyle = PANEL_FILL;
		context.fill();
		context.lineWidth = unit * 0.5;
		context.strokeStyle = OUTLINE;
		context.stroke();
		const inset = unit * 0.4;
		context.beginPath();
		context.roundRect(
			left + inset,
			top + inset,
			panel.width - 2 * inset,
			panel.height - 2 * inset,
			panel.height / 2 - inset,
		);
		context.lineWidth = unit * 0.15;
		context.strokeStyle = PANEL_RIM;
		context.stroke();

		const rarities = Object.values(Rarity);
		const radius = (this.badgeSize * unit) / 2;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = `${unit * 1.8}px title`;
		context.fillStyle = TEXT;
		context.fillText("Probability (%)", center.x, center.y - unit * 1.4);
		context.font = `${unit * 1.5}px text`;
		const badgeY = center.y + unit * 1.1;
		rarities.forEach((rarity, index) => {
			const x = center.x + (index - (rarities.length - 1) / 2) * this.badgeSpacing * unit;
			const odds = this.odds[rarity];
			const colors = RARITY_COLORS[rarity];
			context.globalAlpha = odds > 0 ? 1 : 0.4;

			context.beginPath();
			context.arc(x, badgeY, radius, 0, 2 * Math.PI);
			context.fillStyle = colors.fill;
			context.fill();
			context.lineWidth = unit * 0.45;
			context.strokeStyle = OUTLINE;
			context.stroke();
			context.beginPath();
			context.arc(x, badgeY, radius - unit * 0.2, 0, 2 * Math.PI);
			context.lineWidth = unit * 0.3;
			context.strokeStyle = colors.border;
			context.stroke();

			// The font's "middle" baseline sits a bit above the digits' visual center, so nudge them down.
			const text = Math.round(odds).toString();
			const textY = badgeY + unit * 0.15;
			context.lineWidth = unit * 0.3;
			context.strokeStyle = OUTLINE;
			context.strokeText(text, x, textY);
			context.fillStyle = TEXT;
			context.fillText(text, x, textY);
		});
		context.restore();
	}
}
