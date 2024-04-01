export class Position {
  x: number;
  y: number;
  type = "position";

  constructor(param: { x: number; y: number }) {
    this.x = param.x;
    this.y = param.y;
  }

  clone() {
    return new Position({ x: this.x, y: this.y });
  }
}

export class Cell {
  x: number;
  y: number;
  type = "cell";

  constructor(param: { x: number; y: number }) {
    this.x = param.x;
    this.y = param.y;
  }

  clone() {
    return new Cell({ x: this.x, y: this.y });
  }
}
