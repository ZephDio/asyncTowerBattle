import { Tag } from "../../engine/tags/tagged";
import { SPECIES_TAGS } from "../../engine/tags/species/species-tag";
import { BUILDING_TAGS } from "../../engine/tags/building/building-tags";
import { BIOME_TAGS } from "../../engine/tags/biome/biome-tags";
import { ALIGNMENT_TAGS } from "../../engine/tags/alignment/alignment-tags";
import { TagResource, TagResources } from "../../../../renderer/resources/tag.resources";

type Point = { x: number; y: number };

// Display order by group: species and buildings, then biomes, then alignments.
const TAG_ORDER: readonly (readonly Tag[])[] = [[...SPECIES_TAGS, ...BUILDING_TAGS], BIOME_TAGS, ALIGNMENT_TAGS];

function tagPriority(tag: Tag) {
	return TAG_ORDER.findIndex((group) => group.includes(tag));
}

export function sortTags(tags: Tag[]) {
	return [...tags].sort((a, b) => tagPriority(a) - tagPriority(b));
}

export class TagBadge {
	style: TagResource;
	label: string;

	constructor(public tag: Tag) {
		this.style = TagResources[tag];
		this.label = tag.toUpperCase();
	}

	private iconSize(height: number) {
		return height * 0.78;
	}

	private padding(height: number) {
		return height * 0.3;
	}

	private setFont(context: CanvasRenderingContext2D, height: number) {
		context.font = `${height * 0.76}px text`;
	}

	width(context: CanvasRenderingContext2D, height: number) {
		this.setFont(context, height);
		const textWidth = context.measureText(this.label).width;
		const iconWidth = this.iconSize(height) + this.padding(height) * 0.7;
		return this.padding(height) * 2 + iconWidth + textWidth;
	}

	// `left` is the left edge of the badge, `centerY` its vertical center, in canvas pixels.
	draw(context: CanvasRenderingContext2D, left: number, centerY: number, height: number) {
		const width = this.width(context, height);
		const top = centerY - height / 2;
		const padding = this.padding(height);

		context.save();
		context.beginPath();
		context.roundRect(left, top, width, height, height * 0.35);
		context.fillStyle = this.style.fill;
		context.fill();
		context.lineWidth = Math.max(1, height * 0.08);
		context.strokeStyle = this.style.ink;
		context.stroke();

		const iconSize = this.iconSize(height);
		context.drawImage(this.style.image, left + padding, centerY - iconSize / 2, iconSize, iconSize);
		const textLeft = left + padding + iconSize + padding * 0.7;

		this.setFont(context, height);
		context.fillStyle = this.style.ink;
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.fillText(this.label, textLeft, centerY + height * 0.04);
		context.restore();
	}
}

// Draws badges in rows of `perRow`, the whole block of rows being vertically centered on `center`.
export function drawTagBadgeRows(
	context: CanvasRenderingContext2D,
	badges: TagBadge[],
	center: Point,
	height: number,
	maxWidth: number,
	perRow: number,
) {
	const rowCount = Math.ceil(badges.length / perRow);
	const rowSpacing = height * 1.15;
	for (let row = 0; row < rowCount; row++) {
		const y = center.y + (row - (rowCount - 1) / 2) * rowSpacing;
		drawTagBadgeRow(context, badges.slice(row * perRow, (row + 1) * perRow), { x: center.x, y }, height, maxWidth);
	}
}

// Draws badges on one row centered on `center`, shrinking them if the row is wider than `maxWidth`.
function drawTagBadgeRow(
	context: CanvasRenderingContext2D,
	badges: TagBadge[],
	center: Point,
	height: number,
	maxWidth: number,
) {
	if (badges.length === 0) return;
	const gap = height * 0.3;
	const rowWidth = (h: number) =>
		badges.reduce((total, badge) => total + badge.width(context, h), 0) + gap * (h / height) * (badges.length - 1);
	const fullWidth = rowWidth(height);
	const scaledHeight = fullWidth > maxWidth ? height * (maxWidth / fullWidth) : height;
	const scaledGap = gap * (scaledHeight / height);

	let left = center.x - rowWidth(scaledHeight) / 2;
	for (const badge of badges) {
		badge.draw(context, left, center.y, scaledHeight);
		left += badge.width(context, scaledHeight) + scaledGap;
	}
}
