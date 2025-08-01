// utils/parse.js
import { Position, TargetConfig, TargetElement } from "../types";

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
 * Parses target elements based on targets option, target option (backward compatibility), and attribute.
 */
export const parseTargets = (
  el: HTMLElement, 
  attr: string, 
  targetsOption?: (string | TargetConfig)[],
  targetOption?: string | string[] | Element | Element[]
): TargetElement[] => {
  // New targets option takes highest priority
  if (targetsOption && targetsOption.length > 0) {
    return targetsOption.flatMap(target => {
      if (typeof target === 'string') {
        // String selector - no individual styles
        return Array.from(document.querySelectorAll(target)).map(element => ({
          element: element as HTMLElement,
          styles: undefined
        }));
      } else {
        // TargetConfig - with individual styles
        return Array.from(document.querySelectorAll(target.selector)).map(element => ({
          element: element as HTMLElement,
          styles: target.styles
        }));
      }
    });
  }
  
  // Legacy target option (backward compatibility)
  if (targetOption) {
    if (typeof targetOption === 'string') {
      return Array.from(document.querySelectorAll(targetOption)).map(element => ({
        element: element as HTMLElement,
        styles: undefined
      }));
    } else if (Array.isArray(targetOption)) {
      if (typeof targetOption[0] === 'string') {
        return (targetOption as string[]).flatMap(selector => 
          Array.from(document.querySelectorAll(selector)).map(element => ({
            element: element as HTMLElement,
            styles: undefined
          }))
        );
      } else {
        return (targetOption as Element[]).map(element => ({
          element: element as HTMLElement,
          styles: undefined
        }));
      }
    } else {
      return [{
        element: targetOption as HTMLElement,
        styles: undefined
      }];
    }
  }
  
  // Fall back to attribute
  const selector = el.getAttribute(attr);
  if (selector) {
    return Array.from(document.querySelectorAll(selector)).map(element => ({
      element: element as HTMLElement,
      styles: undefined
    }));
  }
  
  // No targets specified - return empty array (trigger element will be handled separately)
  return [];
};

/**
 * Parses the scrub root attribute.
 */
export const parseRootAttribute = (el: HTMLElement, attr: string, defaultValue: "viewport" | "element"): "viewport" | "element" => {
  const allowedValues = ["viewport", "element"] as const;
  const value = el.getAttribute(attr);
  return allowedValues.includes(value as "viewport" | "element") ? (value as "viewport" | "element") : defaultValue;
};
