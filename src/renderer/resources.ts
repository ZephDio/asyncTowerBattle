function createImage(src: string): HTMLImageElement {
	const image = new Image();
	image.src = src;
	return image;
}

export const Resources = {
	tower: {
		orange: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/towers/tower_red.png"),
				shape: "ellipse",
				color: "orange",
			},
		},
		blue: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/towers/tower_blue.png"),
				shape: "ellipse",
				color: "blue",
			},
		},
		green: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/towers/tower_yellow.png"),
				shape: "rectangle",
				color: "green",
			},
		},
	},
	unit: {
		soldier: {
			size: {
				width: 2,
				height: 2,
			},
			resource: {
				shape: "ellipse",
				image: createImage("/resources/units/soldier.png"),
			},
		},
		dragon: {
			size: {
				width: 3,
				height: 3,
			},
			resource: {
				image: createImage("/resources/units/dragon.png"),
				shape: "ellipse",
			},
		},
	},
	path: {
		normal: {
			resource: "#C4A484",
		},
	},
	castle: {
		size: {
			width: 7,
			height: 7,
		},
		resource: {
			image: createImage("/resources/castle/castle_blue.png"),
			shape: "rectangle",
			color: "#3b3b3b",
		},
	},
	projectiles: {
		bullet: {
			resource: {
				image: createImage("/resources/projectiles/bullet.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
		},
		rocket: {
			resource: {
				image: createImage("/resources/projectiles/rocket.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
		},
	},
	areaEffects: {
		explosion: {
			resource: {
				shape: "ellipse",
				color: "red",
			},
		},
	},
	verdict: {
		victory: {
			size: {
				width: 25,
				height: 20,
			},
			resource: {
				image: createImage("/resources/verdict/victory.png"),
			},
		},
		defeat: {
			size: {
				width: 20,
				height: 22,
			},
			resource: {
				image: createImage("/resources/verdict/defeat.png"),
			},
		},
	},
	hudElement: {
		startBattle: {
			resource: {
				image: createImage("/resources/button/start.png"),
			},
		},
	},
} as const;
