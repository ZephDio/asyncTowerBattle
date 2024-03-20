export interface Position {
  x: number
  y: number
}

export function getDistance(positionA: Position, positionB: Position) {
  const differentialX = positionA.x - positionB.x;
  const differentialY = positionA.y - positionB.y;
  return Math.sqrt(
    Math.pow(differentialX, 2) + Math.pow(differentialY, 2)
  );
}