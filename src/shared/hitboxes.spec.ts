import { Derive } from '@ddd-ts/traits';
import { TCollider, Rectangle, Circle } from './hitboxes';
import { Position } from './position';



describe('TCollider', () => {

  it('square to square', () => {
    class A extends Derive(TCollider([new Rectangle({ h: 5, w: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    expect(new A(0, 0).intersects(new A(0, 0))).toBe(true); // exact same position

    expect(new A(0, 0).intersects(new A(4, 0))).toBe(true); // x touching
    expect(new A(0, 0).intersects(new A(6, 0))).toBe(false); // x not touching

    expect(new A(0, 0).intersects(new A(0, 4))).toBe(true); // y touching
    expect(new A(0, 0).intersects(new A(0, 6))).toBe(false); // y not touching

    expect(new A(0, 0).intersects(new A(4, 4))).toBe(true); // both touching
    expect(new A(0, 0).intersects(new A(6, 6))).toBe(false); // both not touching
  });

  it('circle to circle', () => {
    class A extends Derive(TCollider([new Circle({ r: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    expect(new A(0, 0).intersects(new A(0, 0))).toBe(true); // exact same position

    expect(new A(0, 0).intersects(new A(7, 0))).toBe(true); // x touching
    expect(new A(0, 0).intersects(new A(11, 0))).toBe(false); // x not touching

    expect(new A(0, 0).intersects(new A(0, 7))).toBe(true); // y touching
    expect(new A(0, 0).intersects(new A(0, 11))).toBe(false); // y not touching

    expect(new A(0, 0).intersects(new A(7, 7))).toBe(true); // both touching
    expect(new A(0, 0).intersects(new A(8, 8))).toBe(false); // both not touching
  });

  it('square to circle', () => {
    class A extends Derive(TCollider([new Rectangle({ h: 5, w: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    class B extends Derive(TCollider([new Circle({ r: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    expect(new A(0, 0).intersects(new B(0, 0))).toBe(true); // exact same position

    expect(new A(0, 0).intersects(new B(7, 0))).toBe(true); // x touching
    expect(new A(0, 0).intersects(new B(8, 0))).toBe(false); // x not touching

    expect(new A(0, 0).intersects(new B(0, 7))).toBe(true); // y touching
    expect(new A(0, 0).intersects(new B(0, 8))).toBe(false); // y not touching

    expect(new A(0, 0).intersects(new B(5, 5))).toBe(true); // both touching
    expect(new A(0, 0).intersects(new B(7, 7))).toBe(false); // both not touching
  })

  it('circle to square', () => {
    class A extends Derive(TCollider([new Circle({ r: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    class B extends Derive(TCollider([new Rectangle({ h: 5, w: 5 })])) {
      position: Position;
      constructor(x: number, y: number) {
        super({});
        this.position = new Position({ x, y });
      }
    }

    expect(new A(0, 0).intersects(new B(0, 0))).toBe(true); // exact same position

    expect(new A(0, 0).intersects(new B(7, 0))).toBe(true); // x touching
    expect(new A(0, 0).intersects(new B(8, 0))).toBe(false); // x not touching

    expect(new A(0, 0).intersects(new B(0, 7))).toBe(true); // y touching
    expect(new A(0, 0).intersects(new B(0, 8))).toBe(false); // y not touching

    expect(new A(0, 0).intersects(new B(5, 5))).toBe(true); // both touching
    expect(new A(0, 0).intersects(new B(7, 7))).toBe(false); // both not touching
  })
});