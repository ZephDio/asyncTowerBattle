import { createImage } from "./image";

export type SpriteFrame = { x: number; y: number; w: number; h: number };

// The TexturePacker / Aseprite "array" JSON format, only the fields the game reads.
type SpriteSheetData = {
	frames: { frame: SpriteFrame; duration: number }[];
	meta: { frameTags: { name: string; from: number; to: number }[] };
};

// One atlas image holding every frame of a piece, plus the frames' rectangles and durations and the named animations
// (tags). Every entity of the piece shares the same instance, so the image is loaded once and switching frames only
// copies another rectangle of it. Until the data is ready, frameAt returns null and the piece draws its still image.
export class SpriteSheet {
	private static stills = new WeakMap<HTMLImageElement, SpriteSheet>();
	private data: SpriteSheetData | null = null;

	private constructor(public image: HTMLImageElement) {}

	static fromJson(imageSrc: string, dataSrc: string) {
		const sheet = new SpriteSheet(createImage(imageSrc));
		fetch(dataSrc)
			.then((response) => response.json())
			.then((data: SpriteSheetData) => {
				sheet.data = data;
			})
			.catch((error) => console.error(`could not load sprite sheet ${dataSrc}`, error));
		return sheet;
	}

	// A sheet whose only frame is the whole image, under every tag asked for. Cached per image, so every entity
	// drawing that image shares it.
	static still(image: HTMLImageElement) {
		const cached = SpriteSheet.stills.get(image);
		if (cached) return cached;
		const sheet = new SpriteSheet(image);
		SpriteSheet.stills.set(image, sheet);
		return sheet;
	}

	// Loops the tag's frames, elapsed is in milliseconds since the animation started. frameDuration, when given,
	// replaces the duration of every frame.
	frameAt(tag: string, elapsed: number, frameDuration?: number): SpriteFrame | null {
		if (!this.data) return this.stillFrame();
		const frameTag = this.data.meta.frameTags.find((frameTag) => frameTag.name === tag);
		if (!frameTag) return null;
		const frames = this.data.frames.slice(frameTag.from, frameTag.to + 1);
		const durationOf = (frame: { duration: number }) => frameDuration ?? frame.duration;
		const loopDuration = frames.reduce((total, frame) => total + durationOf(frame), 0);
		let remaining = elapsed % loopDuration;
		for (const frame of frames) {
			if (remaining < durationOf(frame)) return frame.frame;
			remaining -= durationOf(frame);
		}
		return frames[0]?.frame ?? null;
	}

	// The total duration of the tag's frames in milliseconds, or null until the data is loaded.
	tagDuration(tag: string): number | null {
		const frameTag = this.data?.meta.frameTags.find((frameTag) => frameTag.name === tag);
		if (!this.data || !frameTag) return null;
		return this.data.frames.slice(frameTag.from, frameTag.to + 1).reduce((total, frame) => total + frame.duration, 0);
	}

	// The whole image once it is loaded, for a still sheet.
	private stillFrame(): SpriteFrame | null {
		if (SpriteSheet.stills.get(this.image) !== this || !this.image.complete) return null;
		return { x: 0, y: 0, w: this.image.naturalWidth, h: this.image.naturalHeight };
	}
}
