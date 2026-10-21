import { Trait } from "@ddd-ts/traits";

// Lets an image-drawn element swap its image and rotation at draw time. TImageDrawable falls back to its own image
// when getImageVariant returns null.
export const TImageVariant = Trait((base) => {
	abstract class IImageVariant extends base {
		abstract getImageVariant(): { image: HTMLImageElement; theta: number } | null;
	}
	return IImageVariant;
});
