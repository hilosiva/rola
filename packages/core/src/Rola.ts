import { version } from "../../../package.json";
import type { CallbackFunction, EntryOptions, RolaOptions } from "./types";
import { lerp } from "./utlis/math";
import { parseBoolean, parsePositionAttribute, parseRootAttribute, parseTargets } from "./utlis/parse";
import { evaluateExpression } from "./utlis/expression";
import { getRootMargin, normalizeRootMargin } from "./utlis/rootMargin";

/**
 * Rola - A library for managing IntersectionObserver and scroll-based animations.
 *
 * @license MIT
 *
 * GitHub Repository: https://github.com/hilosiva/rola
 */

export default class Rola {
  // === CONSTANTS ===
  static version = version;
  private static readonly CONFIG = {
    STOP_THRESHOLD: 5000,
    SMOOTHING_FACTOR: 0.1,
    PREFIX: "rola"
  } as const;

  // === STATE MANAGEMENT ===
  private static isScrubRunning = false;
  private static windowHeight: number = window.innerHeight;
  private static previousScrollY: number | null = null;
  private static previousScrollTime = performance.now();
  private static previousScrubEntryCount = 0;
  private static requestAnimationFrameId: number | null = null;

  // === OBSERVERS AND COLLECTIONS ===
  private static resizeObserver: ResizeObserver | null = null;
  private static observers: Map<string, IntersectionObserver> = new Map();
  private static entries: Map<Element, { entryOptions: EntryOptions; callback?: CallbackFunction }> = new Map();
  private static scrubEntries: Map<Element, { entryOptions: EntryOptions; callback?: CallbackFunction }> = new Map();

  // === ACCESSIBILITY AND RESPONSIVE ===
  private static reducedMotionMediaQuery: MediaQueryList | null = null;
  private static prefersReducedMotion = false;
  private static breakpointQueries: Map<number, MediaQueryList> = new Map();
  private static currentBreakpoints: Set<number> = new Set();

  // ===================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ===================================================================

  /**
   * Observes the elements matching the selector and initializes their options.
   */
  constructor(selector: string, options?: Partial<RolaOptions>, callback?: CallbackFunction) {
    const elements = document.querySelectorAll<HTMLElement>(selector);

    if (!elements.length) {
      return;
    }

    const defaultOptions: RolaOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
      once: false,
      scrub: false,
      velocityCustomProperty: false,
      progressCustomProperty: true,
      respectReducedMotion: true,
      breakpointType: 'min',
      progressCustomPropertyName: `--${Rola.CONFIG.PREFIX}-progress`,
      velocityCustomPropertyName: `--${Rola.CONFIG.PREFIX}-velocity`,
    };

    const configs: RolaOptions = Object.assign(defaultOptions, options);

    // Initialize reduced motion detection
    Rola._initReducedMotionDetection();
    
    // Initialize breakpoint detection
    Rola._initBreakpointDetection(configs);

    const observerKey = Rola.getObserverKey(configs);

    if (!Rola.observers.has(observerKey)) {
      const observer = new IntersectionObserver((entries) => {
        Rola._handleIntersection(entries, observer);
      }, options);
      Rola.observers.set(observerKey, observer);
    }

    const observer = Rola.observers.get(observerKey);
    for (const el of elements) {
      const entryOptions = Rola._getEntryOptions(el, configs);

      Rola.entries.set(el, { entryOptions, callback });

      // Set inview attribute on trigger element (always)
      entryOptions.triggerElement.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "false");
      
      // Set inview attribute on target elements
      for (const target of entryOptions.targets) {
        target.element.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "false");
      }

      if (entryOptions.scrub) {
        Rola.resizeObserver?.observe(el);
      }

      observer?.observe(el);
    }
  }

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  /**
   * Calls callback function with object-style parameters.
   */
  private static _callCallback(
    callback: CallbackFunction,
    element: Element,
    isInView: boolean,
    options?: EntryOptions,
    progress?: number,
    velocity?: number
  ) {
    callback({
      element,
      isInView,
      progress,
      velocity,
      options
    });
  }

  // ===================================================================
  // CORE LIFECYCLE METHODS
  // ===================================================================

  /**
   * Handles the intersection of observed elements.
   */
  private static _handleIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    for (const entry of entries) {
      const entryData = Rola.entries.get(entry.target);

      if (!entryData) continue;

      const { entryOptions, callback } = entryData;

      if (entry.isIntersecting) {
        // Set inview attribute on trigger element
        entryOptions?.triggerElement.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "true");
        
        // Set inview attribute on target elements
        if (entryOptions?.targets) {
          for (const target of entryOptions.targets) {
            target.element.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "true");
          }
        }

        if (callback && !entryOptions?.scrub) {
          Rola._callCallback(callback, entry.target, true, entryOptions);
        }

        if (entryOptions?.scrub) {
          Rola._initResizeObserver();
          Rola.scrubEntries.set(entry.target, entryData);
          Rola.resizeObserver?.observe(entry.target);
          Rola.scrubStart();
        }

        if (entryOptions?.once) {
          observer.unobserve(entry.target);
          Rola.entries.delete(entry.target);
        }
      } else {
        if (!entryOptions?.once) {
          // Set inview attribute on trigger element
          entryOptions?.triggerElement.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "false");
          
          // Set inview attribute on target elements
          if (entryOptions?.targets) {
            for (const target of entryOptions.targets) {
              target.element.setAttribute(`data-${Rola.CONFIG.PREFIX}-inview`, "false");
            }
          }

          if (callback && !entryOptions?.scrub) {
            Rola._callCallback(callback, entry.target, false, entryOptions);
          }
        }

        if (entryOptions?.scrub) {
          Rola.scrubEntries.delete(entry.target);
          Rola.resizeObserver?.unobserve(entry.target);
        }
      }
    }

    if (Rola.scrubEntries.size === 0) {
      Rola.resizeObserver?.disconnect();
      Rola.stopScrub();
    }

    if (Rola.entries.size === 0) {
      Rola.destroy();
    }
  }

  /**
   * Waits for a scroll event to restart scrubbing.
   */
  private static _waitForScroll() {
    const onScroll = () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      Rola.scrubStart();
    };

    window.addEventListener("scroll", onScroll, { capture: true, once: true });
  }

  // ===================================================================
  // INITIALIZATION METHODS
  // ===================================================================

  /**
   * Initializes the ResizeObserver for monitoring size changes of elements.
   */
  private static _initResizeObserver() {
    if (Rola.resizeObserver) return;

    Rola.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        Rola.refresh(el);
      }
    });
  }

  /**
   * Initializes reduced motion detection using matchMedia.
   */
  private static _initReducedMotionDetection() {
    if (Rola.reducedMotionMediaQuery) return;

    if (typeof window !== 'undefined' && window.matchMedia) {
      Rola.reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      Rola.prefersReducedMotion = Rola.reducedMotionMediaQuery.matches;

      // Listen for changes in reduced motion preference
      const handleChange = (event: MediaQueryListEvent) => {
        Rola.prefersReducedMotion = event.matches;
        
        if (event.matches) {
          // Clear existing styles when reduced motion is enabled
          Rola._clearAllStyles();
        } else {
          // Reapply styles when reduced motion is disabled
          Rola._reapplyAllStyles();
        }
      };

      Rola.reducedMotionMediaQuery.addEventListener('change', handleChange);
    }
  }

  /**
   * Initializes breakpoint detection using matchMedia.
   */
  private static _initBreakpointDetection(configs: RolaOptions) {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // Extract breakpoints from styles
    const breakpoints = Rola._extractBreakpoints(configs.styles);
    
    // Also extract from targets
    if (configs.targets) {
      for (const target of configs.targets) {
        if (typeof target === 'object' && 'styles' in target && target.styles) {
          const targetBreakpoints = Rola._extractBreakpoints(target.styles);
          breakpoints.push(...targetBreakpoints);
        }
      }
    }

    // Remove duplicates and setup media queries
    const uniqueBreakpoints = [...new Set(breakpoints)];
    
    for (const bp of uniqueBreakpoints) {
      if (!Rola.breakpointQueries.has(bp)) {
        const query = `(${configs.breakpointType}-width: ${bp}px)`;
        const mediaQuery = window.matchMedia(query);
        
        Rola.breakpointQueries.set(bp, mediaQuery);
        
        // Update current breakpoints
        if (mediaQuery.matches) {
          Rola.currentBreakpoints.add(bp);
        }
        
        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
          if (event.matches) {
            Rola.currentBreakpoints.add(bp);
          } else {
            Rola.currentBreakpoints.delete(bp);
          }
          
          // Immediately reapply styles to all active scrub entries
          Rola._reapplyAllStyles();
        };
        
        mediaQuery.addEventListener('change', handleChange);
      }
    }
  }

  /**
   * Extracts breakpoint values from styles object.
   */
  private static _extractBreakpoints(styles?: Record<string, unknown>): number[] {
    if (!styles) return [];
    
    return Object.keys(styles)
      .map(key => Number.parseInt(key, 10))
      .filter(num => !Number.isNaN(num));
  }

  /**
   * Gets the current active breakpoint based on breakpoint type.
   */
  private static _getCurrentBreakpoint(breakpointType: 'min' | 'max'): number | null {
    if (Rola.currentBreakpoints.size === 0) return null;
    
    const sortedBreakpoints = Array.from(Rola.currentBreakpoints).sort((a, b) => {
      return breakpointType === 'min' ? b - a : a - b; // min: largest first, max: smallest first
    });
    
    return sortedBreakpoints[0] || null;
  }

  // ===================================================================
  // STYLE MANAGEMENT METHODS
  // ===================================================================

  /**
   * Applies responsive styles based on current breakpoint.
   */
  private static _applyResponsiveStyles(
    element: HTMLElement,
    styles: Record<string, unknown>,
    progress: number,
    velocity: number,
    breakpointType: 'min' | 'max',
    currentBreakpoint: number | null
  ) {
    // Collect all applicable styles based on breakpoints
    const applicableStyles: Record<string, unknown> = {};
    
    // Start with base styles (non-numeric keys)
    for (const [key, value] of Object.entries(styles)) {
      if (Number.isNaN(Number.parseInt(key, 10))) {
        applicableStyles[key] = value;
      }
    }
    
    // Apply breakpoint-specific styles in order
    const breakpointKeys = Object.keys(styles)
      .map(key => Number.parseInt(key, 10))
      .filter(num => !Number.isNaN(num))
      .sort((a, b) => breakpointType === 'min' ? a - b : b - a);
    
    for (const bp of breakpointKeys) {
      const shouldApply = breakpointType === 'min' 
        ? Rola.currentBreakpoints.has(bp)
        : Rola.currentBreakpoints.has(bp);
      
      if (shouldApply && styles[bp]) {
        const breakpointStyles = styles[bp] as Record<string, unknown>;
        for (const [property, value] of Object.entries(breakpointStyles)) {
          applicableStyles[property] = value;
        }
      }
    }
    
    // Apply the final computed styles
    for (const [property, styleValue] of Object.entries(applicableStyles)) {
      if (styleValue === false) {
        // Remove the property
        element.style.removeProperty(property);
      } else {
        // Apply the style
        let computedValue: string;
        
        if (typeof styleValue === 'function') {
          computedValue = styleValue(progress, velocity);
        } else {
          computedValue = evaluateExpression(styleValue as string, progress, velocity);
        }
        
        element.style.setProperty(property, computedValue);
      }
    }
  }

  /**
   * Parses options for a given element.
   */
  private static _getEntryOptions(el: HTMLElement, options: RolaOptions): EntryOptions {
    const rect = el.getBoundingClientRect();

    return {
      start: parsePositionAttribute(el, `data-${Rola.CONFIG.PREFIX}-scrub-start`, ["top", "bottom"]),
      end: parsePositionAttribute(el, `data-${Rola.CONFIG.PREFIX}-scrub-end`, ["bottom", "top"]),
      rect,
      top: rect.top + window.scrollY,
      scrub: parseBoolean(el, `data-${Rola.CONFIG.PREFIX}-scrub`, options.scrub || false),
      once: parseBoolean(el, `data-${Rola.CONFIG.PREFIX}-once`, options.once || false),
      triggerElement: el,
      targets: parseTargets(el, `data-${Rola.CONFIG.PREFIX}-target`, options.targets, options.target),
      margin: getRootMargin(options.rootMargin),
      scrubRoot: parseRootAttribute(el, `data-${Rola.CONFIG.PREFIX}-scrub-root`, "element"),
      rootMargin: options.rootMargin || "0px",
      previousProgress: null,
      velocityCustomProperty: parseBoolean(el, `data-${Rola.CONFIG.PREFIX}-velocity`, options.velocityCustomProperty || false),
      progressCustomProperty: parseBoolean(el, `data-${Rola.CONFIG.PREFIX}-progress-custom-property`, options.progressCustomProperty ?? true),
      triggerStyles: options.styles,
      respectReducedMotion: options.respectReducedMotion ?? true,
      breakpointType: options.breakpointType ?? 'min',
      currentBreakpoint: Rola._getCurrentBreakpoint(options.breakpointType ?? 'min'),
      progressCustomPropertyName: options.progressCustomPropertyName,
      velocityCustomPropertyName: options.velocityCustomPropertyName,
    };
  }

  /**
   * Observer key create.
   */
  private static getObserverKey(configs: IntersectionObserverInit): string {
    const { root, rootMargin, threshold } = configs;

    const normalizedRootMargin = normalizeRootMargin(rootMargin || "0px");
    const normalizedThreshold = Array.isArray(threshold) ? threshold.sort((a, b) => a - b) : threshold;

    return JSON.stringify({
      root,
      rootMargin: normalizedRootMargin,
      threshold: normalizedThreshold,
    });
  }

  /**
   * Refreshes the entry options for an element.
   */
  static refresh(el: Element) {
    Rola.windowHeight = window.innerHeight;

    const rect = el.getBoundingClientRect();
    const entryData = Rola.entries.get(el);

    if (!entryData) return;

    const { entryOptions, callback } = entryData;

    entryOptions.rect = rect;
    entryOptions.top = rect.top + window.scrollY; // 初期位置を更新
    entryOptions.margin = getRootMargin(entryOptions.rootMargin);
    Rola.entries.set(el, { entryOptions, callback });
  }

  /**
   * Starts the scrubbing process using `requestAnimationFrame`.
   */
  static scrubStart() {
    if (Rola.isScrubRunning || Rola.scrubEntries.size === 0) return;
    Rola.isScrubRunning = true;
    Rola.previousScrollY = null;

    const updateScrub = () => {
      const currentTime = performance.now();
      const currentScrollY = window.scrollY;
      const currentScrubEntryCount = Rola.scrubEntries.size;

      if (
        Rola.isScrubRunning &&
        (Rola.previousScrubEntryCount !== currentScrubEntryCount || Rola.previousScrollY !== currentScrollY)
      ) {
        Rola.update();

        Rola.previousScrollY = currentScrollY;
        Rola.previousScrollTime = currentTime;
        Rola.previousScrubEntryCount = currentScrubEntryCount;
      } else if (currentTime - Rola.previousScrollTime > Rola.CONFIG.STOP_THRESHOLD) {
        Rola.stopScrub();
        Rola._waitForScroll();
        return;
      }

      if (Rola.scrubEntries.size > 0) {
        Rola.requestAnimationFrameId = requestAnimationFrame(updateScrub);
      } else {
        Rola.stopScrub();
      }
    };

    if (Rola.scrubEntries.size > 0) {
      updateScrub();
    }
  }

  /**
   * Stops the scrubbing process.
   */
  static stopScrub() {
    if (Rola.requestAnimationFrameId) {
      cancelAnimationFrame(Rola.requestAnimationFrameId);
      Rola.requestAnimationFrameId = null;
    }
    Rola.isScrubRunning = false;
  }

  /**
   * Updates the progress of scrub-enabled elements based on scroll position.
   */
  static update() {
    for (const [el, entryData] of Rola.scrubEntries.entries()) {
      const { entryOptions, callback } = entryData;

      const rectTop = entryOptions.top - window.scrollY;
      const scrubRootHeight = entryOptions.scrubRoot === "element" ? entryOptions.rect.height : Rola.windowHeight;

      const viewportHeight = Rola.windowHeight + entryOptions.margin.top + entryOptions.margin.bottom;

      const viewportStart = entryOptions.start.viewport * viewportHeight - entryOptions.margin.top;
      const viewportEnd = entryOptions.end.viewport * viewportHeight - entryOptions.margin.top;

      const triggerStart = entryOptions.start.trigger * scrubRootHeight;
      const triggerEnd = entryOptions.end.trigger * scrubRootHeight;

      const start = viewportStart - triggerStart;
      const end = viewportEnd - triggerEnd;

      const progress = Math.min(Math.max((rectTop - start) / (end - start), 0), 1);
      const velocity = Math.abs(progress - (entryOptions.previousProgress ?? 0));

      const smoothingFactor = Rola.CONFIG.SMOOTHING_FACTOR;
      const smoothedVelocity = lerp(entryOptions.previousVelocity ?? velocity, velocity, smoothingFactor);

      if (entryOptions.previousProgress !== progress) {
        // Skip styles if reduced motion is preferred and respectReducedMotion is enabled
        const shouldSkipStyles = entryOptions.respectReducedMotion && Rola.prefersReducedMotion;

        // Apply styles to trigger element
        if (entryOptions.triggerStyles && !shouldSkipStyles) {
          Rola._applyResponsiveStyles(
            entryOptions.triggerElement, 
            entryOptions.triggerStyles, 
            progress, 
            smoothedVelocity,
            entryOptions.breakpointType,
            entryOptions.currentBreakpoint
          );
        }

        // Apply styles and properties to target elements
        for (const target of entryOptions.targets) {
          if (entryOptions.progressCustomProperty) {
            target.element.style.setProperty(
              `${entryOptions.progressCustomPropertyName}`,
              `${progress}`,
            );
          }

          if (entryOptions.velocityCustomProperty) {
            target.element.style.setProperty(
              `${entryOptions.velocityCustomPropertyName}`,
              `${smoothedVelocity}`,
            );
          }

          // Apply individual target styles
          if (target.styles && !shouldSkipStyles) {
            Rola._applyResponsiveStyles(
              target.element, 
              target.styles, 
              progress, 
              smoothedVelocity,
              entryOptions.breakpointType,
              entryOptions.currentBreakpoint
            );
          }
        }

        if (callback) {
          Rola._callCallback(callback, el, Rola.isScrubRunning, entryOptions, progress, smoothedVelocity);
        }

        entryOptions.previousProgress = progress;
        Rola.scrubEntries.set(el, { entryOptions, callback });
      }
    }
  }

  /**
   * Clears all applied styles from trigger and target elements.
   */
  private static _clearAllStyles() {
    for (const [el, entryData] of Rola.scrubEntries.entries()) {
      const { entryOptions } = entryData;
      
      if (!entryOptions.respectReducedMotion) continue;

      // Clear trigger element styles
      if (entryOptions.triggerStyles) {
        for (const property of Object.keys(entryOptions.triggerStyles)) {
          entryOptions.triggerElement.style.removeProperty(property);
        }
      }

      // Clear target element styles
      for (const target of entryOptions.targets) {
        if (target.styles) {
          for (const property of Object.keys(target.styles)) {
            target.element.style.removeProperty(property);
          }
        }
      }
    }
  }

  /**
   * Reapplies styles to all active scrub entries immediately.
   */
  private static _reapplyAllStyles() {
    for (const [el, entryData] of Rola.scrubEntries.entries()) {
      const { entryOptions } = entryData;
      
      // Update current breakpoint for this entry
      entryOptions.currentBreakpoint = Rola._getCurrentBreakpoint(entryOptions.breakpointType);
      
      // Force style reapplication with current progress
      if (entryOptions.previousProgress !== null) {
        const progress = entryOptions.previousProgress;
        const velocity = entryOptions.previousVelocity ?? 0;
        
        // Skip styles if reduced motion is preferred and respectReducedMotion is enabled
        const shouldSkipStyles = entryOptions.respectReducedMotion && Rola.prefersReducedMotion;

        // Reapply styles to trigger element
        if (entryOptions.triggerStyles && !shouldSkipStyles) {
          Rola._applyResponsiveStyles(
            entryOptions.triggerElement, 
            entryOptions.triggerStyles, 
            progress, 
            velocity,
            entryOptions.breakpointType,
            entryOptions.currentBreakpoint
          );
        }

        // Reapply styles to target elements
        for (const target of entryOptions.targets) {
          if (target.styles && !shouldSkipStyles) {
            Rola._applyResponsiveStyles(
              target.element, 
              target.styles, 
              progress, 
              velocity,
              entryOptions.breakpointType,
              entryOptions.currentBreakpoint
            );
          }
        }
      }
    }
  }

  /**
   * Destroys the Rola instance by clearing all observers and entries.
   */
  static destroy() {
    for (const observer of Rola.observers.values()) observer.disconnect();
    Rola.resizeObserver?.disconnect();
    Rola.observers.clear();
    Rola.entries.clear();
    Rola.scrubEntries.clear();
    Rola.stopScrub();
  }
}
