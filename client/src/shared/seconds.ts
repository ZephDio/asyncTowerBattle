export const secondsToFrame = (seconds: number) => 32 * seconds;
export const frameToSeconds = (frame: number) => frame / 32;
export const castSpeedFromSeconds = (seconds: number) => 960 / 32 / seconds;
export const castCostFromFrames = (frames: number) => 960 * (frames / 32);
export const castSpeedToSecond = (castSpeed: number) => Math.round((960 / castSpeed / 32) * 10) / 10;

/** Blueprints state movement speed on a player-friendly scale, 1 is this many grid units per tick. */
const MOVEMENT_SPEED_UNIT = 0.065;
export const movementSpeedToDistancePerTick = (speed: number) => speed * MOVEMENT_SPEED_UNIT;
