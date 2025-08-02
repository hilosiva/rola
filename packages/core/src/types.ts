export type StyleValue = string | ((progress: number, velocity?: number) => string);
export type ResponsiveStyleValue = StyleValue | false; // false means remove the property

// Simple and flexible styles object
export type StylesObject = Record<string, StyleValue | false | Record<string, ResponsiveStyleValue>>;

export type TargetSelector = 
  | string 
  | Element 
  | ((triggerElement: HTMLElement) => Element | Element[] | null);

export interface TargetConfig {
  selector: TargetSelector;
  styles?: StylesObject;
}

export interface RolaOptions extends IntersectionObserverInit {
  once: boolean; // Whether to observe the element only once.
  scrub: boolean; // Whether to enable scrubbing for the element.
  velocityCustomProperty: boolean; // Whether to enable scrubbing for the element.
  progressCustomProperty: boolean; // Whether to set progress custom property for the element.
  respectReducedMotion: boolean; // Whether to respect prefers-reduced-motion setting.
  breakpointType: 'min' | 'max'; // Type of breakpoint detection (min-width or max-width).
  styles?: StylesObject; // Dynamic styles applied to trigger element.
  target?: string | string[] | Element | Element[]; // Target element(s) for backward compatibility.
  targets?: (TargetSelector | TargetConfig)[]; // Target elements for applying properties and styles.
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
  respectReducedMotion: boolean; // Whether to respect prefers-reduced-motion setting.
  breakpointType: 'min' | 'max'; // Type of breakpoint detection (min-width or max-width).
  currentBreakpoint: number | null; // Current active breakpoint.
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
