export const secondsToFrame = (seconds: number) => 32 * seconds;
export const frameToSeconds = (frame: number) => frame / 32;
export const castSpeedFromSeconds = (seconds: number) => 960 / 32 / seconds;
export const castCostFromFrames = (frames: number) => 960 * (frames / 32);
export const castSpeedToSecond = (castSpeed: number) => Math.round((960 / castSpeed / 32) * 10) / 10;
