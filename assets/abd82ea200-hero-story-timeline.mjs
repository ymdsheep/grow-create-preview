export const DURATION = 14500;
export const TRACKS = Object.freeze({
  planting: {start: 0, full: 0, fade: 2000, end: 2200},
  watering: {start: 2000, full: 2200, fade: 5700, end: 5900},
  watching: {start: 5700, full: 5900, fade: 8300, end: 8500},
  resting: {start: 8300, full: 8500},
  seed: {start: 350, full: 650, fade: 2100, end: 2450},
  sprout: {start: 2100, full: 2450, fade: 4000, end: 4350},
  young: {start: 4000, full: 4350, fade: 6050, end: 6450},
  developing: {start: 6050, full: 6450, fade: 8350, end: 8800},
  mature: {start: 8350, full: 8800},
  water: {start: 2250, full: 2400, fade: 5650, end: 5700},
  town: {start: 11500, full: 14500, peak: .72},
});
export const GROWTH = Object.freeze({
  sprout: {start: 2100, end: 4250, scale: .14, rotate: -3},
  young: {start: 4000, end: 6300, scale: .38, rotate: 1.5},
  developing: {start: 6050, end: 8600, scale: .66, rotate: 0},
  mature: {start: 8350, end: 10500, scale: .72, rotate: 0},
});

export function opacityFrames(track) {
  const peak = track.peak ?? 1;
  const points = new Map([[0, 0], [track.start, 0], [track.full, peak]]);
  if (track.end !== undefined) {
    points.set(track.fade, peak);
    points.set(track.end, 0);
    points.set(DURATION, 0);
  } else {
    points.set(DURATION, peak);
  }
  return [...points].sort((a, b) => a[0] - b[0]).map(([time, opacity]) => ({offset: time / DURATION, opacity}));
}
