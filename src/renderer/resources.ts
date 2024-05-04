function createImage(src: string): HTMLImageElement {
	const image = new Image();
	image.src = src;
	return image;
}

export const Resources = {
	tower: {
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
				height: 10,
			},
			resource: {
				image: {
					frontView: createImage("/resources/towers/poison-tower/front-view.png"),
					backView: createImage("/resources/towers/poison-tower/back-view.png"),
					leftView: createImage("/resources/towers/poison-tower/left-view.png"),
					rightView: createImage("/resources/towers/poison-tower/right-view.png"),
				},
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
	totem: {
		anvil: {
			size: {
				width: 6.2,
				height: 6,
			},
			resource: {
				image: {
					frontView: createImage("/resources/totem/anvil/front-view.png"),
					backView: createImage("/resources/totem/anvil/back-view.png"),
					leftView: createImage("/resources/totem/anvil/left-view.png"),
					rightView: createImage("/resources/totem/anvil/right-view.png"),
				},
				shape: "ellipse",
				color: "orange",
			},
		},
		cropsfield: {
			size: {
				width: 5,
				height: 5,
			},
			resource: {
				image: createImage("/resources/totem/crops-field.png"),
				shape: "rectangle",
			},
		},
		obelisk: {
			size: {
				width: 4,
				height: 10,
			},
			resource: {
				image: createImage("/resources/totem/obelisk.png"),
				shape: "rectangle",
			},
		},
		bakery: {
			size: {
				width: 6,
				height: 6,
			},
			resource: {
				image: {
					frontView: createImage("/resources/totem/bakery/front-view.png"),
					backView: createImage("/resources/totem/bakery/back-view.png"),
					leftView: createImage("/resources/totem/bakery/left-view.png"),
					rightView: createImage("/resources/totem/bakery/right-view.png"),
				},
				shape: "rectangle",
			},
		},
		brewery: {
			size: {
				width: 10,
				height: 5,
			},
			resource: {
				image: createImage("/resources/totem/brewery.png"),
				shape: "rectangle",
			},
		},
		windmill: {
			size: {
				width: 6.4,
				height: 6.4,
			},
			resource: {
				image: {
					frontView: createImage("/resources/totem/windmill/front-view.png"),
					backView: createImage("/resources/totem/windmill/back-view.png"),
					leftView: createImage("/resources/totem/windmill/left-view.png"),
					rightView: createImage("/resources/totem/windmill/right-view.png"),
				},
				shape: "rectangle",
			},
		},
		mine: {
			size: {
				width: 5,
				height: 5,
			},
			resource: {
				image: createImage("/resources/totem/mine.png"),
				shape: "ellipse",
			},
		},
		gobelinportal: {
			size: {
				width: 5,
				height: 5,
			},
			resource: {
				image: createImage("/resources/totem/gobelin-portal.png"),
				shape: "ellipse",
				color: "orange",
			},
		},
	},
	unit: {
		soldier: {
			size: {
				width: 3,
				height: 3,
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
		gobelin: {
			size: {
				width: 2.8,
				height: 2.8,
			},
			resource: {
				image: createImage("/resources/units/gobelin.png"),
				shape: "ellipse",
			},
		},
		dwarf: {
			size: {
				width: 3,
				height: 3,
			},
			resource: {
				image: createImage("/resources/units/dwarf.png"),
				shape: "rectangle",
			},
		},
		fox: {
			size: {
				width: 3,
				height: 2,
			},
			resource: {
				image: createImage("/resources/units/fox.png"),
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
		trap: {
			resource: "#C4A484",
			image: createImage("/resources/path/trap.png"),
		},
	},
	environment: {
		rock: {
			resource: {
				image: createImage("/resources/environment/rock.png"),
				shape: "ellipse",
				color: "#3b3b3b",
			},
			size: {
				width: 4.9,
				height: 4.9,
			},
		},
		forest: {
			resource: {
				image: createImage("/resources/environment/forest.png"),
				shape: "ellipse",
				color: "#3b3b3b",
			},
			size: {
				width: 4.9,
				height: 4.9,
			},
		},
	},
	castle: {
		human : {
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
		dwarf : {
			size: {
				width: 7,
				height: 7,
			},
			resource: {
				image: createImage("/resources/castle/castle_purple.png"),
				shape: "rectangle",
				color: "#3b3b3b",
			},
		}
		
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
		startGame: {
			resource: {
				image: createImage("/resources/button/start-game.png"),
			},
			size: {
				width: 50,
				height: 20,
			},
		},
		factionSelector: {
			resource: {
				image: createImage("/resources/hud/selector.png"),
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
		slider: {
			resource: {
				image: createImage("/resources/button/slider.png"),
			},
		},
		cursor: {
			resource: {
				image: createImage("/resources/button/cursor.png"),
			},
		},
		banner: {
			resource: {
				image: createImage("/resources/hud/banner.png"),
			},
		},
		icons: {
			food: {
				image: createImage("/resources/economy/food.png"),
			},
			health: {
				image: createImage("/resources/hud/health.png"),
			},
			movespeed: {
				image: createImage("/resources/hud/speed.svg"),
			},
			vitality: {
				image: createImage("/resources/hud/vitality.svg"),
			},
			castSpeed: {
				image: createImage("/resources/hud/cast-speed.svg"),
			},
			attack: {
				image: createImage("/resources/hud/attack.svg"),
			},
			tower: {
				image: createImage("/resources/hud/tower.svg"),
			},
			unit: {
				image: createImage("/resources/hud/unit.svg"),
			},
			furry: {
				image: createImage("/resources/hud/furry.png"),
			},
		},
	},
} as const;
