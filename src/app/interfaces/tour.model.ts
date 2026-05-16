// tour.model.ts

export type TourStepPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface TourStep {
  /** CSS selector or element ID (prefixed with #) to spotlight */
  target: string;
  /** Tour step title */
  title: string;
  /** Tour step description */
  content: string;
  /**
   * Optional identifier so pages can exclude this step at runtime.
   * E.g. exclude the 'approvals-card' step when there are no approvals.
   */
  stepId?: string;
  /** Position of the tooltip relative to the target element */
  position?: TourStepPosition;
  /** Extra offset in pixels from the target element */
  offset?: { x?: number; y?: number };
  /** Milliseconds to wait before trying to find element (for dynamic content) */
  waitForElement?: number;
  /** If true, clicking the highlighted element advances the tour */
  clickToAdvance?: boolean;
  /** Extra CSS classes to add to the tooltip */
  tooltipClass?: string;
}

export interface TourConfig {
  /** Unique key for this page tour – used to track first-visit in localStorage */
  tourKey: string;
  /** Optional display name shown in the tour header */
  pageName?: string;
  /** Ordered list of tour steps */
  steps: TourStep[];
}

export interface TourState {
  currentStep: number;
  isActive: boolean;
  totalSteps: number;
}
