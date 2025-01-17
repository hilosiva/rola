// utils/math.js

/**
 * Lerp
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};
