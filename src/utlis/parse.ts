// utils/parse.js
import { Position } from "../types";

/**
 * Parses a position from an element.
 */
export const parsePositionAttribute = (el: HTMLElement, attr: string, defaultValue: string[]): Position => {
  const value = el.getAttribute(attr);
  const values = value ? value.split(" ") : [];

  const parseValue = (value: string): number => {
    if (value.endsWith("%")) {
      return Number.parseFloat(value) / 100;
    }
    switch (value) {
      case "top":
        return 0;
      case "center":
        return 0.5;
      case "bottom":
        return 1;
      default:
        return 0;
    }
  };

  return {
    trigger: parseValue(values[0] || defaultValue[0]),
    viewport: parseValue(values[1] || defaultValue[1]),
  };
};

/**
 * Parses a boolean attribute from an element.
 */
export const parseBoolean = (el: HTMLElement, attr: string, defaultValue: boolean): boolean => {
  const value = el.getAttribute(attr);
  return value === null ? defaultValue : value !== "false";
};

/**
 * Parses a target element based on an attribute.
 */
export const parseTarget = (el: HTMLElement, attr: string): HTMLElement | null => {
  const selector = el.getAttribute(attr);
  return selector ? document.querySelector(selector) : el;
};

/**
 * Parses the scrub root attribute.
 */
export const parseRootAttribute = (el: HTMLElement, attr: string, defaultValue: "viewport" | "element"): "viewport" | "element" => {
  const allowedValues = ["viewport", "element"] as const;
  const value = el.getAttribute(attr);
  return allowedValues.includes(value as "viewport" | "element") ? (value as "viewport" | "element") : defaultValue;
};
