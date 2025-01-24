import { RolaOptions, EntryOptions, CallbackFunction } from "./types";
import { parsePositionAttribute, parseBoolean, parseRootAttribute, parseTarget } from "./utlis/parse";
import { getRootMargin, normalizeRootMargin } from "./utlis/rootMargin";
import { lerp } from "./utlis/math";
import { version } from "../../../package.json";

/**
 * Rola - A library for managing IntersectionObserver and scroll-based animations.
 *
 * @license MIT
 *
 * GitHub Repository: https://github.com/hilosiva/rola
 */

export default class Rola {
  static version = version;
  private static isScrubRunning = false;
  private static resizeObserver: ResizeObserver | null = null;
  private static observers: Map<string, IntersectionObserver> = new Map();
  private static entries: Map<Element, { entryOptions: EntryOptions; callback?: CallbackFunction }> = new Map();
  private static scrubEntries: Map<Element, { entryOptions: EntryOptions; callback?: CallbackFunction }> = new Map();
  private static requestAnimationFrameId: number | null = null;
  private static windowHeight: number = window.innerHeight;
  private static previousScrollY: number | null = null;
  private static previousScrollTime = performance.now();
  private static previousScrubEntryCount = 0;
  private static stopThreshold = 5000;
  private static prefix = "rola";

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
      progressCustomPropertyName: `--${Rola.prefix}-progress`,
      velocityCustomPropertyName: `--${Rola.prefix}-velocity`,
    };

    const configs: RolaOptions = Object.assign(defaultOptions, options);

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

      entryOptions.target?.setAttribute(`data-${Rola.prefix}-inview`, "false");

      if (entryOptions.scrub) {
        Rola.resizeObserver?.observe(el);
      }

      observer?.observe(el);
    }
  }

  /**
   * Handles the intersection of observed elements.
   */
  private static _handleIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    for (const entry of entries) {
      const entryData = Rola.entries.get(entry.target);

      if (!entryData) continue;

      const { entryOptions, callback } = entryData;

      if (entry.isIntersecting) {
        entryOptions?.target?.setAttribute(`data-${Rola.prefix}-inview`, "true");

        if (callback && !entryOptions?.scrub) callback(entry.target, true, entryOptions);

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
          entryOptions?.target?.setAttribute(`data-${Rola.prefix}-inview`, "false");

          if (callback && !entryOptions?.scrub) callback(entry.target, false, entryOptions);
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
   * Parses options for a given element.
   */
  private static _getEntryOptions(el: HTMLElement, options: RolaOptions): EntryOptions {
    const rect = el.getBoundingClientRect();

    return {
      start: parsePositionAttribute(el, `data-${Rola.prefix}-scrub-start`, ["top", "bottom"]),
      end: parsePositionAttribute(el, `data-${Rola.prefix}-scrub-end`, ["bottom", "top"]),
      rect,
      top: rect.top + window.scrollY,
      scrub: parseBoolean(el, `data-${Rola.prefix}-scrub`, options.scrub || false),
      once: parseBoolean(el, `data-${Rola.prefix}-once`, options.once || false),
      target: parseTarget(el, `data-${Rola.prefix}-target`),
      margin: getRootMargin(options.rootMargin),
      scrubRoot: parseRootAttribute(el, `data-${Rola.prefix}-scrub-root`, "element"),
      rootMargin: options.rootMargin || "0px",
      previousProgress: null,
      velocityCustomProperty: parseBoolean(el, `data-${Rola.prefix}-velocity`, options.velocityCustomProperty || false),
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

      if (Rola.isScrubRunning && (Rola.previousScrubEntryCount !== currentScrubEntryCount || Rola.previousScrollY !== currentScrollY)) {
        Rola.update();

        Rola.previousScrollY = currentScrollY;
        Rola.previousScrollTime = currentTime;
        Rola.previousScrubEntryCount = currentScrubEntryCount;
      } else if (currentTime - Rola.previousScrollTime > Rola.stopThreshold) {
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

      const smoothingFactor = 0.1;
      const smoothedVelocity = lerp(entryOptions.previousVelocity ?? velocity, velocity, smoothingFactor);

      if (entryOptions.previousProgress !== progress) {
        (entryOptions.target as HTMLElement).style.setProperty(`${entryOptions.progressCustomPropertyName}`, `${progress}`);

        if (entryOptions.velocityCustomProperty) (entryOptions.target as HTMLElement).style.setProperty(`${entryOptions.velocityCustomPropertyName}`, `${smoothedVelocity}`);

        if (callback) callback(el, Rola.isScrubRunning, entryOptions, progress);

        entryOptions.previousProgress = progress;
        Rola.scrubEntries.set(el, { entryOptions, callback });
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
