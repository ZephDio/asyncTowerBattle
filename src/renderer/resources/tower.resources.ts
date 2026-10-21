import { createImage } from "../../shared/image";
import { Size } from "../../shared/size";
import { HTMLImageElementAsset } from "../../shared/traits/render/image-drawable";

export type ShapedResource = {
  size: Size
  image: HTMLImageElement | HTMLImageElementAsset;
  shape: string;
}

export type Resource = {
  size: Size
  image: HTMLImageElement | HTMLImageElementAsset;
}

export const createViews = (folder: string): HTMLImageElementAsset => ({
	frontView: createImage(`${folder}/front-view.png`),
	backView: createImage(`${folder}/back-view.png`),
	leftView: createImage(`${folder}/left-view.png`),
	rightView: createImage(`${folder}/right-view.png`),
});

export class TowerResources {
  static blue : ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/towers/blue"),
		shape: "ellipse",
	}

  static frost: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/towers/frost"),
		shape: "ellipse",
	}

  static green: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/towers/green"),
		shape: "rectangle",
	}

  static witchHouse: ShapedResource = {
		size: {
			width: 5,
			height: 10,
		},
		image: {
			frontView: createImage("/resources/towers/poison-tower/front-view.png"),
			backView: createImage("/resources/towers/poison-tower/back-view.png"),
			leftView: createImage("/resources/towers/poison-tower/left-view.png"),
			rightView: createImage("/resources/towers/poison-tower/right-view.png"),
		},
		shape: "rectangle",
	}

  static purple: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/towers/purple"),
		shape: "rectangle",
	}
}