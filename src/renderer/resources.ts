type ResourceType = { [key: string]: any };

export const Resources: ResourceType = {
  tower: {
    orange: {
      size: {
        width: 5,
        height: 10,
      },
      resource: {
        src: "./resources/towers/tower-1.png",
        shape: "ellipse",
        color: "orange",
      },
    },
    blue: {
      size: {
        width: 5,
        height: 10,
      },
      resource: {
        src: "./resources/towers/tower-2.png",
        shape: "ellipse",
        color: "blue",
      },
    },
    green: {
      size: {
        width: 3,
        height: 6,
      },
      resource: {
        src: "./resources/towers/tower-3.png",
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
        src: "./resources/units/soldier.png",
      },
    },
    dragon: {
      size: {
        width: 3,
        height: 3,
      },
      resource: {
        src: "./resources/units/dragon.png",
        shape: "ellipse",
      }
    }
  },
  path: {
    normal: {
      resource: "#C4A484",
    },
  },
  castle: {
    size: {
      width: 6,
      height: 7,
    },
    resource: {
      src: "./resources/castle/castle.png",
      shape: "rectangle",
      color: "#3b3b3b",
    },
  },
  projectiles: {
    bullet: {
      resource: {
        src: "./resources/projectiles/bullet.png",
        shape: "rectangle",
        color: "#3b3b3b",
      }
    },
    rocket: {
      resource: {
        src: "./resources/projectiles/rocket.png",
        shape: "rectangle",
        color: "#3b3b3b",
      }
    }
  },
  areaEffects: {
    explosion: {
      resource: {
        shape: "ellipse",
        color: 'red'
      }
    }
  },
  verdict: {
    victory: {
      size: {
        width: 25,
        height: 20,
      },
      resource: {
        src: "./resources/verdict/victory.png",
      },
    },
    defeat: {
      size: {
        width: 20,
        height: 22,
      },
      resource: {
        src: "./resources/verdict/defeat.png",
      },
    },
  },
  hudElement: {
    startBattle: {
      resource: {
        src: "./resources/button/start.png",
      },
    },
  },
};
