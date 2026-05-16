// tour.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TourConfig, TourState, TourStep } from '../../interfaces/tour.model';

const SEEN_PREFIX = 'app_tour_seensteps_';

@Injectable({ providedIn: 'root' })
export class TourService {

  private _state$ = new BehaviorSubject<TourState>({
    currentStep: 0,
    isActive: false,
    totalSteps: 0
  });

  private _config: TourConfig | null = null;

  state$ = this._state$.asObservable();

  public tourAvailable$ = new BehaviorSubject<boolean>(false);
  private _retakeAction: (() => void) | null = null;

  get currentConfig(): TourConfig | null { return this._config; }
  get snapshot(): TourState { return this._state$.getValue(); }

  registerRetakeAction(action: () => void) {
    this._retakeAction = action;
    this.tourAvailable$.next(true);
  }

  unregisterRetakeAction() {
    this._retakeAction = null;
    this.tourAvailable$.next(false);
  }

  triggerRetake() {
    if (this._retakeAction) {
      this._retakeAction();
    }
  }

  // ── Per-step seen tracking ─────────────────────────────────────────────────

  /** Returns the list of stepIds already shown to this user for this tour. */
  getSeenStepIds(tourKey: string): string[] {
    try {
      const raw = localStorage.getItem(SEEN_PREFIX + tourKey);
      if (!raw) return [];
      // Legacy format: plain 'true' means whole tour was completed
      if (raw === 'true') return ['__legacy_complete__'];
      return JSON.parse(raw) as string[];
    } catch { return []; }
  }

  /** Marks the given stepIds as seen (merges with existing). */
  markStepsSeen(tourKey: string, stepIds: string[]): void {
    if (!stepIds.length) return;
    const existing = this.getSeenStepIds(tourKey).filter(s => s !== '__legacy_complete__');
    const merged = Array.from(new Set([...existing, ...stepIds]));
    localStorage.setItem(SEEN_PREFIX + tourKey, JSON.stringify(merged));
  }

  /**
   * Filters `steps` to only those not yet seen by the user.
   * Steps without a `stepId` are always considered unseen (always shown).
   */
  getUnseenSteps(tourKey: string, steps: TourStep[]): TourStep[] {
    const seen = new Set(this.getSeenStepIds(tourKey));
    if (seen.has('__legacy_complete__')) return []; // legacy: whole tour was done
    return steps.filter(s => !s.stepId || !seen.has(s.stepId));
  }

  /**
   * True if all steps in the provided list have been seen (or legacy 'true' present).
   * Steps without a stepId are excluded from the check (they're always shown).
   */
  hasSeenAllSteps(tourKey: string, steps: TourStep[]): boolean {
    const seen = new Set(this.getSeenStepIds(tourKey));
    if (seen.has('__legacy_complete__')) return true;
    const trackable = steps.filter(s => !!s.stepId);
    return trackable.length > 0 && trackable.every(s => seen.has(s.stepId!));
  }

  /** Old compatibility shim used by overlay for retake-tour check. */
  hasSeenTour(tourKey: string): boolean {
    const raw = localStorage.getItem(SEEN_PREFIX + tourKey);
    return raw === 'true' || raw === '__legacy_complete__';
  }

  /** Clears all seen data for this tour (used by resetTourSeen / retake). */
  resetTourSeen(tourKey: string): void {
    localStorage.removeItem(SEEN_PREFIX + tourKey);
  }

  // ── Tour lifecycle ─────────────────────────────────────────────────────────

  /**
   * Starts the tour with the given config.
   * If `force` is true, bypasses the seen check entirely.
   */
  startTour(config: TourConfig, force = false): boolean {
    this._config = config;
    this._state$.next({
      currentStep: 0,
      isActive: true,
      totalSteps: config.steps.length
    });
    return true;
  }

  nextStep(): void {
    const state = this._state$.getValue();
    if (!this._config) return;
    const next = state.currentStep + 1;
    if (next >= this._config.steps.length) {
      this.endTour();
    } else {
      this._state$.next({ ...state, currentStep: next });
    }
  }

  prevStep(): void {
    const state = this._state$.getValue();
    if (state.currentStep > 0) {
      this._state$.next({ ...state, currentStep: state.currentStep - 1 });
    }
  }

  goToStep(index: number): void {
    const state = this._state$.getValue();
    if (!this._config || index < 0 || index >= this._config.steps.length) return;
    this._state$.next({ ...state, currentStep: index });
  }

  /** Ends the tour. Does NOT mark steps seen — the overlay does that. */
  endTour(): void {
    this._state$.next({ currentStep: 0, isActive: false, totalSteps: 0 });
    this._config = null;
  }

  restartTour(): void {
    if (!this._config) return;
    this._state$.next({
      currentStep: 0,
      isActive: true,
      totalSteps: this._config.steps.length
    });
  }
}
