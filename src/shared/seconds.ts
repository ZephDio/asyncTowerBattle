export const seconds = (seconds: number) => 31.25 * seconds;
export const frame = (frame: number) => Math.round((frame / 31.25) * 100) / 100;
