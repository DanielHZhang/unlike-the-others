function hrtimeMs() {
  const time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

/**
 * Converts the [seconds, nanoseconds] tuple returned by `process.hrtime` to milliseconds.
 * @param time The hrtime represented in milliseconds.
 */
export function hrtimeToMs(time: [number, number]): number {
  return time[0] * 1000 + time[1] / 1e6;
}
