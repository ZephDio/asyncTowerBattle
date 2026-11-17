// Pieces load their images and sprite sheets when their modules load. Tests run in Node, so an image is a plain
// object there and those loads never settle.
class StubImage {
	src = "";
	width = 0;
	height = 0;
	complete = true;
	onload: (() => void) | null = null;
}

Object.assign(globalThis, { Image: StubImage, fetch: () => new Promise(() => {}) });
