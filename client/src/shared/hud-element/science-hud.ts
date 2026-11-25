import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Army } from "../../engine/army/army";
import { Inventory } from "../../engine/grid/inventory/unit-inventory";
import { blueprintsRequiring } from "../../engine/shop/retail/retail-filler";
import { HudElementResources } from "../../renderer/resources/hud-element.resources";
import { IconResources } from "../../renderer/resources/icons.resources";
import { HitBox } from "../hitbox/hitboxe";
import { Rectangle } from "../hitbox/shapes/rectangle";
import { ScreenPosition } from "../position";
import { TCollider } from "../traits/engine/core/TCollider";
import { THitbox } from "../traits/engine/core/THitbox";
import { Science, grantedSciencesOf } from "../traits/engine/science";
import { TDrawable } from "../traits/render/drawable";
import { DrawPriority } from "../traits/render/image-drawable";
import { TRenderable } from "../traits/render/renderable";
import { Description, TDescriptor } from "../traits/render/huds/item-descriptor";

// Sizes in screen units, from the ribbon's images at the army banner's density (5 image pixels per unit, see
// scripts/generate-science-ribbon.py).
const PIXEL = 1 / 5;
const WIDTH = 30 * PIXEL;
const TOP = 14 * PIXEL;
const SEGMENT = 22 * PIXEL;
const TAIL = 16 * PIXEL;
const STAMP = 16 * PIXEL;
// The ribbon grows a segment for each seal up to FULL_LENGTH seals, then keeps that length: the seals come closer
// together, and once they would touch they alternate left and right of the ribbon by ZIGZAG.
const FULL_LENGTH = 4;
const ZIGZAG = 6 * PIXEL;

const SCIENCE_NAMES: Record<Science, string> = {
	[Science.Elf]: "Elf",
	[Science.Dwarf]: "Dwarf",
};

const nameOf = (element: object) =>
	implementsTrait(element, TDescriptor) ? element.description.name : element.constructor.name;

// The shop's ribbon right of the reserve: a seal for each science the army holds, top to bottom. Hovering a seal
// describes the science: what grants it in the army and what it unlocks in the shop. It hangs from the top of the
// reserve, so it is not shown when the army holds no science.
export class ScienceHud extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: WIDTH, height: TOP + TAIL }), new ScreenPosition({ x: 0, y: 0 })]])),
	TDrawable,
	TRenderable,
) {
	drawPriority = DrawPriority.HUD;
	position: ScreenPosition;
	sciences: Science[];
	private top: number;

	constructor(
		private army: Army,
		reserve: Inventory,
	) {
		super({});
		this.sciences = Object.values(Science).filter((science) => army.sciences.has(science));
		const reserveRight = reserve.centerPosition.x + (reserve.width * reserve.cellSize) / 2;
		this.top = reserve.centerPosition.y + (reserve.height * reserve.cellSize) / 2;
		const height = TOP + this.segments * SEGMENT + TAIL;
		this.position = new ScreenPosition({ x: (reserveRight + 100) / 2, y: this.top - height / 2 });
		this.hitbox = new HitBox([[new Rectangle({ width: WIDTH, height }), new ScreenPosition({ x: 0, y: 0 })]]);
	}

	get seals() {
		return this.sciences.length;
	}

	private get segments() {
		return Math.min(this.seals, FULL_LENGTH);
	}

	// From one seal's center to the next.
	private get spacing() {
		return this.seals > 0 ? (this.segments * SEGMENT) / this.seals : SEGMENT;
	}

	// The center of the seal of the science at `index`.
	private sealCenter(index: number) {
		const zigzag = this.spacing < STAMP ? (index % 2 === 0 ? -ZIGZAG : ZIGZAG) : 0;
		return new ScreenPosition({ x: this.position.x + zigzag, y: this.top - TOP - (index + 0.5) * this.spacing });
	}

	// What hovering `point` describes: the science of the nearest seal under it, as seals overlap once they zigzag.
	describedAt(point: ScreenPosition): ScienceDescription | null {
		let nearest: { science: Science; distance: number } | null = null;
		this.sciences.forEach((science, index) => {
			const center = this.sealCenter(index);
			const dx = point.x - center.x;
			const dy = point.y - center.y;
			if (Math.abs(dx) > STAMP / 2 || Math.abs(dy) > STAMP / 2) return;
			const distance = Math.hypot(dx, dy);
			if (!nearest || distance < nearest.distance) nearest = { science, distance };
		});
		return nearest ? this.describe((nearest as { science: Science }).science) : null;
	}

	private describe(science: Science): ScienceDescription {
		const granters = this.army.scienceGranters.filter((element) => grantedSciencesOf(element).includes(science));
		const unlocked = blueprintsRequiring(science);
		return {
			description: new Description(`${SCIENCE_NAMES[science]} science`, [
				"Granted by:",
				...granters.map((element) => `  ${nameOf(element)}`),
				"",
				"Unlocks in the shop:",
				...(unlocked.length ? unlocked.map((blueprint) => `  ${nameOf(blueprint)}`) : ["  nothing yet"]),
			]),
			grantedSciences: [science],
		};
	}

	draw(context: CanvasRenderingContext2D) {
		if (this.sciences.length === 0) return;
		context.save();
		context.imageSmoothingEnabled = false;
		const { top: topImage, segment, tail } = HudElementResources.scienceRibbon;
		const piece = (image: HTMLImageElement, fromTop: number, height: number) =>
			this.drawImage(
				context,
				this.getCanvasSize(context, WIDTH, height),
				this.getCanvasPosition(context, new ScreenPosition({ x: this.position.x, y: this.top - fromTop - height / 2 })),
				image,
			);
		piece(topImage.image, 0, TOP);
		for (let index = 0; index < this.segments; index++) piece(segment.image, TOP + index * SEGMENT, SEGMENT);
		piece(tail.image, TOP + this.segments * SEGMENT, TAIL);
		this.sciences.forEach((science, index) =>
			this.drawImage(
				context,
				this.getCanvasSize(context, STAMP, STAMP),
				this.getCanvasPosition(context, this.sealCenter(index)),
				IconResources.scienceStamps[science].image,
			),
		);
		context.restore();
	}
}

// A science's description, with its own stamp in the corner of the descriptor.
export type ScienceDescription = { description: Description; grantedSciences: Science[] };
