export interface RolaOptions extends IntersectionObserverInit {
  once: boolean; // Whether to observe the element only once.
  scrub: boolean; // Whether to enable scrubbing for the element.
  velocityCustomProperty: boolean; // Whether to enable scrubbing for the element.
  progressCustomPropertyName: string; // Name of the CSS custom property used for progress.
  velocityCustomPropertyName: string; // Name of the CSS custom property used for previous progress.
}

export interface Margin {
  top: number; // Top margin for the root area.
  bottom: number; // Bottom margin for the root area.
}

export interface Position {
  trigger: number; // The threshold value for triggering an action.
  viewport: number; // The current value relative to the viewport
}

export interface EntryOptions {
  start: Position; // Start position for scrub.
  end: Position; // End position for scrub.
  target?: Element | null; // Target element for inview.
  rect: DOMRect; // Bounding rectangle of the element.
  top: number; // Top position of the element in the document.
  scrub: boolean; // Whether scrubbing is enabled for this entry.
  once: boolean; // Whether this entry should be observed only once.
  rootMargin: string; // Margins for the root area.
  margin: Margin; // Margins for the root area.
  scrubRoot: "viewport" | "element"; // Defines the root for scrubbing calculations.
  previousProgress: number | null;
  previousVelocity?: number;
  velocityCustomProperty: boolean;
  progressCustomPropertyName: string; // Name of the CSS custom property used for progress.
  velocityCustomPropertyName: string; // Name of the CSS custom property used for previous progress.
}

export type CallbackFunction = (el: Element, isInView: boolean, options?: EntryOptions, progress?: number) => void; // Callback function type for handling intersection and progress updates.
