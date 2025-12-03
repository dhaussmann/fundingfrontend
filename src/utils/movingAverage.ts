/**
 * Calculate moving average over a time window.
 * Uses a sliding window approach for efficiency.
 * @param timeSeries - ordered timestamps array
 * @param values - values corresponding to timestamps
 * @param windowMs - size of window in milliseconds
 * @returns moving average array with null when insufficient data
 */
export function calculateMovingAverage(
  timeSeries: number[],
  values: number[],
  windowMs: number
): (number | null)[] {
  const result: (number | null)[] = [];
  let windowSum = 0;
  let windowCount = 0;
  let windowStartIdx = 0;

  for (let i = 0; i < timeSeries.length; i++) {
    const currentTime = timeSeries[i];
    // Slide window start forward while outside window
    while (timeSeries[windowStartIdx] < currentTime - windowMs) {
      windowSum -= values[windowStartIdx];
      windowCount--;
      windowStartIdx++;
    }
    windowSum += values[i];
    windowCount++;
    result.push(windowCount > 0 ? windowSum / windowCount : null);
  }
  return result;
}

/**
 * Filter moving average arrays to only values visible in current data range.
 * Replaces values outside visible times with null, then removes nulls, matching visible dataset length.
 * @param fullTimes - full timestamps of complete dataset
 * @param fullMA - moving average values matching fullTimes
 * @param visibleTimes - timestamps currently visible (subset)
 * @returns filtered moving average values for visible timestamps
 */
export function filterVisibleMovingAverage(
  fullTimes: number[],
  fullMA: (number | null)[],
  visibleTimes: number[]
): number[] {
  return fullTimes
    .map((t, i) => (visibleTimes.includes(t) ? fullMA[i] : null))
    .filter((val): val is number => val !== null);
}
