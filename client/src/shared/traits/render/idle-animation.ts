import { Subtrait } from "@ddd-ts/traits";
import { SpriteSheet } from "../../sprite-sheet";
import { frameToSeconds } from "../../seconds";
import { HTImageDrawable } from "./image-drawable";
import { TSpriteAnimation } from "./sprite-animation";

// The fox's breathing pace, used by every idle animation that doesn't set its own.
export const DEFAULT_IDLE_FRAME_DURATION = 450;

// Loops the "idle" tag of a sprite sheet on the entity's battle clock, so the animation follows the battle's pace and
// pauses with it. Without a sheet of its own, the entity idles on a single frame: its still image.
// Override idleSheet to give it more frames, and idleFrameDuration (milliseconds per frame) to change its pace.
export const TIdleAnimation = Subtrait([HTImageDrawable, TSpriteAnimation], (base) => {
	abstract class IIdleAnimation extends base {
		abstract clock: number;
		idleSheet: SpriteSheet = SpriteSheet.still(this.drawable.image);
		idleFrameDuration: number = DEFAULT_IDLE_FRAME_DURATION;

		getSpriteFrame() {
			const frame = this.idleSheet.frameAt("idle", frameToSeconds(this.clock) * 1000, this.idleFrameDuration);
			return frame ? { image: this.idleSheet.image, frame } : null;
		}
	}
	return IIdleAnimation;
});
