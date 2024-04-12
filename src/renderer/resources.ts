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
		frost: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/towers/tower_frost.png"),
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
				image: createImage("/resources/towers/tower_green.png"),
				shape: "rectangle",
				color: "green",
			},
		},
		yellow: {
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
		purple: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/towers/tower_purple.png"),
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
		choupisson: {
			size: {
				width: 3,
				height: 3,
			},
			resource: {
				image: createImage("/resources/units/choupisson.png"),
				shape: "ellipse",
			},
		},
		dragon: {
			size: {
				width: 3.3,
				height: 3.3,
			},
			resource: {
				image: createImage("/resources/units/dragon.png"),
				shape: "ellipse",
			},
		},
		priest: {
			size: {
				width: 2.5,
				height: 2.5,
			},
			resource: {
				image: createImage("/resources/units/priest.png"),
				shape: "ellipse",
			},
		},
		berseker: {
			size: {
				width: 3,
				height: 4,
			},
			resource: {
				image: createImage("/resources/units/berseker.png"),
				shape: "ellipse",
			},
		},
	},
	path: {
		normal: {
			resource: "#C4A484",
			image: createImage("/resources/path/normal.png"),
		},
		slowing: {
			resource: "#C4A484",
			image: createImage("/resources/path/slowing.png"),
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
			size: {
				width: 1.9,
				height: 1.5,
			},
		},
		rocket: {
			resource: {
				image: createImage("/resources/projectiles/rocket.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
			size: {
				width: 2.2,
				height: 1.8,
			},
		},
		spark: {
			resource: {
				image: createImage("/resources/projectiles/spark.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
			size: {
				width: 2.7,
				height: 1.2,
			},
		},
		spine: {
			resource: {
				image: createImage("/resources/projectiles/spine.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
			size: {
				width: 2,
				height: 0.9,
			},
		},
		frostSpike: {
			resource: {
				image: createImage("/resources/projectiles/frost_spike.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
			size: {
				width: 2.2,
				height: 1.8,
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
	barracks: {
		basic: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/house/house_blue.png"),
				shape: "rectangle",
				color: "blue",
			},
		},
		wave: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/house/house_red.png"),
				shape: "rectangle",
				color: "red",
			},
		},
		veterant: {
			size: {
				width: 5,
				height: 8,
			},
			resource: {
				image: createImage("/resources/house/house_yellow.png"),
				shape: "rectangle",
				color: "yellow",
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
		bell: {
			resource: {
				image: createImage("/resources/button/bell.png"),
			},
		},
		gold: {
			resource: {
				image: createImage("/resources/economy/gold.png"),
			},
		},
		speedButton: {
			resource: {
				image: {
					timesOne: createImage("/resources/button/buttonone.png"),
					timesTwo: createImage("/resources/button/buttontwo.png"),
					timesThree: createImage("/resources/button/buttonthree.png"),
				},
			},
		},
	},
} as const;
