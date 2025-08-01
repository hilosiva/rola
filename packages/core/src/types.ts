export type StyleValue = string | ((progress: number, velocity?: number) => string);
export type StylesObject = Record<string, StyleValue>;

export interface TargetConfig {
  selector: string;
  styles?: StylesObject;
}

export interface RolaOptions extends IntersectionObserverInit {
  once: boolean; // Whether to observe the element only once.
  scrub: boolean; // Whether to enable scrubbing for the element.
  velocityCustomProperty: boolean; // Whether to enable scrubbing for the element.
  progressCustomProperty: boolean; // Whether to set progress custom property for the element.
  styles?: StylesObject; // Dynamic styles applied to trigger element.
  target?: string | string[] | Element | Element[]; // Target element(s) for backward compatibility.
  targets?: (string | TargetConfig)[]; // Target elements for applying properties and styles.
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

export interface TargetElement {
  element: HTMLElement;
  styles?: StylesObject;
}

export interface EntryOptions {
  start: Position; // Start position for scrub.
  end: Position; // End position for scrub.
  triggerElement: HTMLElement; // The trigger element itself.
  targets: TargetElement[]; // Target elements with their styles.
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
  progressCustomProperty: boolean;
  triggerStyles?: StylesObject; // Styles applied to trigger element.
  progressCustomPropertyName: string; // Name of the CSS custom property used for progress.
  velocityCustomPropertyName: string; // Name of the CSS custom property used for previous progress.
}

export interface CallbackData {
  element: Element;
  isInView: boolean;
  progress: number | undefined;
  velocity: number | undefined;
  options: EntryOptions | undefined;
}

// Callback function type - object-style only  
export type CallbackFunction = (data: CallbackData) => void;
