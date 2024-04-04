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

  down() {
    return new Cell({
      x: this.x,
      y: this.y - 1
    })
  }

  up() {
    return new Cell({
      x: this.x,
      y: this.y + 1
    })
  }

  isAdjascentTo(other: Cell) {
    return (
      Math.abs(this.x - other.x) + Math.abs(this.y - other.y) === 1
    );
  }

  equals(other: Cell) {
    return this.x === other.x && this.y === other.y;
  }

  clone() {
    return new Cell({ x: this.x, y: this.y });
  }
}
