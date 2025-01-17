// utils/rootMargin.js

import { Margin } from "../types";

/**
 * Parses the root margin and converts it to pixel values.
 */
export const getRootMargin = (rootMargin: string | undefined): Margin => {
  let top = 0;
  let bottom = 0;

  if (rootMargin) {
    const margins = rootMargin.split(" ").map((margin) => {
      if (margin.endsWith("px")) {
        return Number.parseFloat(margin);
      }

      if (margin.endsWith("%")) {
        return (Number.parseFloat(margin) / 100) * window.innerHeight;
      }
      return 0;
    });

    if (margins.length === 1) {
      top = bottom = margins[0];
    } else if (margins.length === 2) {
      top = margins[0];
      bottom = margins[0];
    } else if (margins.length === 3) {
      top = margins[0];
      bottom = margins[2];
    } else if (margins.length === 4) {
      top = margins[0];
      bottom = margins[2];
    }
  }

  return {
    top,
    bottom,
  };
};

/**
 * Nomalize root margin.
 */
export const normalizeRootMargin = (rootMargin: string): string => {
  const margins = rootMargin
    .trim()
    .split(/\s+/)
    .map((value) => value.toLowerCase());

  if (margins.length === 1) {
    return `${margins[0]} ${margins[0]} ${margins[0]} ${margins[0]}`;
  }
  if (margins.length === 2) {
    return `${margins[0]} ${margins[1]} ${margins[0]} ${margins[1]}`;
  }

  if (margins.length === 3) {
    return `${margins[0]} ${margins[1]} ${margins[2]} ${margins[1]}`;
  }
  if (margins.length === 4) {
    return `${margins[0]} ${margins[1]} ${margins[2]} ${margins[3]}`;
  }

  throw new Error(`Invalid rootMargin value: "${rootMargin}"`);
};
