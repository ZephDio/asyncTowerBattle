import { Trait } from "@ddd-ts/traits";
import { SpriteFrame } from "../../sprite-sheet";

// Lets an image-drawn element draw one frame of a sprite sheet instead of its still image. TImageDrawable falls back
// to its own image when getSpriteFrame returns null.
export const TSpriteAnimation = Trait((base) => {
	abstract class ISpriteAnimation extends base {
		abstract getSpriteFrame(): { image: HTMLImageElement; frame: SpriteFrame } | null;
	}
	return ISpriteAnimation;
});
