// tour-overlay.component.ts
import {
  Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges,
  NgZone, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { TourService } from '../tour.service';
import { TourConfig, TourState, TourStep, TourStepPosition } from '../../../interfaces/tour.model';

interface SpotlightRect { x: number; y: number; width: number; height: number; rx: number; }

@Component({
  selector: 'app-tour-overlay',
  templateUrl: './tour-overlay.component.html',
  styleUrl: './tour-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltipAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.88) translateY(8px)' }),
        animate('280ms cubic-bezier(0.34,1.56,0.64,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0, transform: 'scale(0.92)' }))
      ])
    ])
  ]
})
export class TourOverlayComponent implements OnInit, OnChanges, OnDestroy {

  /** Base tour config for the page. */
  @Input() tourConfig!: TourConfig;

  /**
   * stepIds to exclude (based on missing page data).
   * Can change over time — overlay reacts to changes and shows newly
   * available steps that the user hasn't seen yet.
   */
  @Input() excludeStepIds: string[] = [];

  /**
   * Observable that emits when page data is ready and the initial
   * tour may start. Until this emits the tour will not auto-start.
   * Falls back to a 600 ms delay if omitted.
   */
  @Input() readyTrigger$?: Observable<void>;

  /** Show the floating "Take Tour" FAB when tour is inactive. */
  @Input() showRetakeBubble = true;

  /** 
   * If true, the overlay will wait (poll briefly) for a dialog to open and then close 
   * before starting the tour. Useful if a dialog like a name prompt is expected right after load.
   */
  @Input() expectDialogBeforeStart = false;

  // ── UI state ───────────────────────────────────────────────────────────────
  isActive = false;
  currentStepIndex = 0;
  currentStep: TourStep | null = null;
  stepsArray: TourStep[] = [];

  spotlightRect: SpotlightRect = { x: 0, y: 0, width: 0, height: 0, rx: 12 };
  svgViewBox = '0 0 1 1';
  tooltipStyle: Record<string, string> = {};
  tooltipPositionClass = '';
  arrowPositionClass = 'arrow-none';

  // ── Internal ───────────────────────────────────────────────────────────────
  /** Becomes true once the initial tour has been started. */
  private _initialTourStarted = false;

  /** stepIds that are part of the currently running mini/full tour. */
  private _currentRunStepIds: string[] = [];

  private _tourSub?: Subscription;
  private _readySub?: Subscription;
  private _dialogWaitSub?: Subscription;
  private _stepDebounce?: ReturnType<typeof setTimeout>;
  private _gracePollTimer?: ReturnType<typeof setTimeout>;
  private _miniTourDebounce?: ReturnType<typeof setTimeout>;
  private _resizeListener?: () => void;

  constructor(
    private tourService: TourService,
    private dialog: MatDialog,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  get isLastStep(): boolean {
    return this.stepsArray.length > 0 && this.currentStepIndex === this.stepsArray.length - 1;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this._connectToService();
    this.tourService.registerRetakeAction(() => this.retakeTour());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tourConfig'] && !changes['tourConfig'].firstChange) {
      this._disconnect();
      this._connectToService();
      return;
    }

    // When excludeStepIds shrinks AFTER the initial tour has already started/run,
    // check if newly available steps are unseen and trigger a mini-tour for them.
    if (changes['excludeStepIds'] && !changes['excludeStepIds'].firstChange && this._initialTourStarted) {
      const prev: string[] = changes['excludeStepIds'].previousValue ?? [];
      const curr: string[] = changes['excludeStepIds'].currentValue ?? [];
      // Steps that were excluded before but are now included
      const newlyAvailable = prev.filter(id => !curr.includes(id));
      if (newlyAvailable.length > 0 && !this.isActive) {
        this._handleNewlyAvailableSteps(newlyAvailable);
      }
    }
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  private _connectToService(): void {
    if (!this.tourConfig) return;
    this._rebuildSteps();

    this._tourSub = this.tourService.state$.subscribe((state: TourState) => {
      this.isActive = state.isActive;
      this.currentStepIndex = state.currentStep;
      this.currentStep = state.isActive ? this.stepsArray[state.currentStep] ?? null : null;
      if (state.isActive && this.currentStep) {
        this._scheduleHighlight(this.currentStep);
      } else {
        this.spotlightRect = { x: 0, y: 0, width: 0, height: 0, rx: 12 };
      }
      this.cdr.markForCheck();
    });

    this._resizeListener = () => {
      if (this.isActive && this.currentStep) this._scheduleHighlight(this.currentStep);
    };
    window.addEventListener('resize', this._resizeListener);
    window.addEventListener('scroll', this._resizeListener, true);

    if (this.readyTrigger$) {
      this._readySub = this.readyTrigger$.pipe(take(1)).subscribe(() => {
        // Wait a tick for Angular change detection to update excludeStepIds
        setTimeout(() => {
          this._startWithGracePeriod();
        });
      });
    } else {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => this.zone.run(() => {
          this._startWithGracePeriod();
        }), 600);
      });
    }
  }

  /**
   * Rebuilds `stepsArray` from tourConfig filtered by current excludeStepIds.
   * Also further filters to only steps the user hasn't seen yet.
   */
  private _rebuildSteps(onlyUnseen = false): void {
    const excluded = new Set(this.excludeStepIds ?? []);
    const available = this.tourConfig.steps.filter(s => !s.stepId || !excluded.has(s.stepId));
    this.stepsArray = onlyUnseen
      ? this.tourService.getUnseenSteps(this.tourConfig.tourKey, available)
      : available;
  }

  // ── Dialog grace period ────────────────────────────────────────────────────

  /**
   * Optionally waits for a dialog to appear (and close) before starting.
   */
  private _startWithGracePeriod(): void {
    const tryStart = () => {
      // If a dialog is currently open, wait for all to close then retry
      if (this.dialog.openDialogs.length > 0) {
        this._dialogWaitSub?.unsubscribe();
        this._dialogWaitSub = this.dialog.afterAllClosed
          .pipe(take(1))
          .subscribe(() => this.zone.run(() => tryStart()));
        return;
      }

      this._doStartTour();
    };

    if (this.expectDialogBeforeStart) {
      let attempts = 0;
      const poll = () => {
        if (this.dialog.openDialogs.length > 0) {
          tryStart(); // Dialog found, wait for it to close
        } else if (attempts < 10) { // 10 * 150ms = 1500ms max wait
          attempts++;
          this._gracePollTimer = setTimeout(poll, 150);
        } else {
          // Dialog never opened, start anyway
          tryStart();
        }
      };
      poll();
    } else {
      tryStart();
    }
  }

  /** Starts the tour with only unseen steps. No-ops if nothing to show. */
  private _doStartTour(): void {
    this._initialTourStarted = true;
    this._rebuildSteps(true /* onlyUnseen */);
    if (this.stepsArray.length === 0) return;

    this._currentRunStepIds = this.stepsArray.map(s => s.stepId).filter(Boolean) as string[];
    const effectiveConfig: TourConfig = { ...this.tourConfig, steps: this.stepsArray };
    this.tourService.startTour(effectiveConfig);
    this.cdr.markForCheck();
  }

  /**
   * Called from ngOnChanges when steps that were previously excluded are
   * now available (data loaded). Triggers a mini-tour for only those new
   * unseen steps (so the user sees them without repeating already-seen steps).
   */
  private _handleNewlyAvailableSteps(newlyAvailableIds: string[]): void {
    // Find the actual TourStep objects for the newly available stepIds
    const newSteps = this.tourConfig.steps.filter(
      s => s.stepId && newlyAvailableIds.includes(s.stepId)
    );
    // Keep only unseen ones
    const unseenNew = this.tourService.getUnseenSteps(this.tourConfig.tourKey, newSteps);
    if (unseenNew.length === 0) return;

    // Give the DOM a moment to render before starting the mini-tour
    clearTimeout(this._miniTourDebounce);
    this._miniTourDebounce = setTimeout(() => {
      this.zone.run(() => {
        if (this.isActive) return; // another tour started in the meantime
        this.stepsArray = unseenNew;
        this._currentRunStepIds = unseenNew.map(s => s.stepId).filter(Boolean) as string[];
        const miniConfig: TourConfig = { ...this.tourConfig, steps: unseenNew };
        this.tourService.startTour(miniConfig, true);
        this.cdr.markForCheck();
      });
    }, 400);
  }

  // ── Step highlighting ──────────────────────────────────────────────────────

  private _scheduleHighlight(step: TourStep): void {
    clearTimeout(this._stepDebounce);
    this._stepDebounce = setTimeout(() => this._applyHighlight(step), (step.waitForElement ?? 0) + 60);
  }

  private _applyHighlight(step: TourStep): void {
    let els: Element[] = [];
    if (step.target) {
      try {
        if (step.targetAll) {
          els = Array.from(document.querySelectorAll(step.target));
        } else {
          const el = document.querySelector(step.target);
          if (el) els = [el];
        }
      } catch {}
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.svgViewBox = `0 0 ${vw} ${vh}`;
    const PAD = 10;

    if (els.length === 0) {
      this.spotlightRect = { x: vw / 2 - 1, y: vh / 2 - 1, width: 2, height: 2, rx: 1 };
      this.tooltipPositionClass = 'position-center';
      this.arrowPositionClass = 'arrow-none';
      this.tooltipStyle = {};
    } else {
      els[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      requestAnimationFrame(() => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.left < minX) minX = r.left;
          if (r.top < minY) minY = r.top;
          if (r.right > maxX) maxX = r.right;
          if (r.bottom > maxY) maxY = r.bottom;
        }
        if (minX === Infinity) {
          minX = 0; minY = 0; maxX = 0; maxY = 0;
        }

        const rect = new DOMRect(minX, minY, maxX - minX, maxY - minY);
        
        this.spotlightRect = {
          x: rect.left - PAD, y: rect.top - PAD,
          width: rect.width + PAD * 2, height: rect.height + PAD * 2, rx: 10
        };
        const pos = step.position ?? this._autoPosition(rect, vw, vh);
        this._setTooltipPosition(rect, pos, vw, vh, step.offset);
        this.cdr.markForCheck();
      });
    }
    this.cdr.markForCheck();
  }

  private _autoPosition(rect: DOMRect, vw: number, vh: number): TourStepPosition {
    if (vh - rect.bottom >= 200) return 'bottom';
    if (rect.top >= 200) return 'top';
    if (vw - rect.right >= 340) return 'right';
    if (rect.left >= 340) return 'left';
    return 'bottom';
  }

  private _setTooltipPosition(rect: DOMRect, position: TourStepPosition, vw: number, vh: number, offset?: { x?: number; y?: number }): void {
    const W = 320, H = 200, GAP = 18;
    const ox = offset?.x ?? 0, oy = offset?.y ?? 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let top: number | undefined, left: number | undefined;

    switch (position) {
      case 'bottom': case 'bottom-left': case 'bottom-right':
        top = rect.bottom + GAP + oy;
        left = Math.max(8, Math.min(cx - W / 2 + ox, vw - W - 8));
        this.arrowPositionClass = position === 'bottom-left' ? 'arrow-bottom-left' : position === 'bottom-right' ? 'arrow-bottom-right' : 'arrow-bottom';
        this.tooltipPositionClass = ''; break;
      case 'top': case 'top-left': case 'top-right':
        top = rect.top - H - GAP + oy;
        left = Math.max(8, Math.min(cx - W / 2 + ox, vw - W - 8));
        this.arrowPositionClass = position === 'top-left' ? 'arrow-top-left' : position === 'top-right' ? 'arrow-top-right' : 'arrow-top';
        this.tooltipPositionClass = ''; break;
      case 'left':
        top = Math.max(8, cy - H / 2 + oy); left = rect.left - W - GAP + ox;
        this.arrowPositionClass = 'arrow-left'; this.tooltipPositionClass = ''; break;
      case 'right':
        top = Math.max(8, cy - H / 2 + oy); left = rect.right + GAP + ox;
        this.arrowPositionClass = 'arrow-right'; this.tooltipPositionClass = ''; break;
      case 'center':
        this.tooltipPositionClass = 'position-center'; this.arrowPositionClass = 'arrow-none';
        this.tooltipStyle = {}; return;
    }

    if (top !== undefined && top < 8) top = 8;
    if (top !== undefined && top + H > vh - 8) top = vh - H - 8;
    if (left !== undefined && left < 8) left = 8;
    if (left !== undefined && left + W > vw - 8) left = vw - W - 8;
    const style: Record<string, string> = {};
    if (top !== undefined) style['top'] = `${top}px`;
    if (left !== undefined) style['left'] = `${left}px`;
    this.tooltipStyle = style;
  }

  // ── Tour controls ──────────────────────────────────────────────────────────

  next(): void { this.tourService.nextStep(); }
  prev(): void { this.tourService.prevStep(); }

  /** Skip: mark all steps shown SO FAR (up to current) as seen, then end. */
  skip(): void {
    const shown = this.stepsArray
      .slice(0, this.currentStepIndex + 1)
      .map(s => s.stepId)
      .filter(Boolean) as string[];
    this.tourService.markStepsSeen(this.tourConfig.tourKey, shown);
    this.tourService.endTour();
  }

  /** Natural finish (last step → Next): mark ALL steps in this run as seen. */
  private _onTourComplete(): void {
    this.tourService.markStepsSeen(this.tourConfig.tourKey, this._currentRunStepIds);
  }

  goToStep(i: number): void { this.tourService.goToStep(i); }

  retakeTour(): void {
    // Reset seen data and show all available steps again
    this.tourService.resetTourSeen(this.tourConfig.tourKey);
    this._rebuildSteps(false);
    this._currentRunStepIds = this.stepsArray.map(s => s.stepId).filter(Boolean) as string[];
    this.tourService.startTour({ ...this.tourConfig, steps: this.stepsArray }, true);
  }

  onBackdropClick(): void { /* do not dismiss on backdrop click */ }

  // ── Intercept last-step next to mark complete ─────────────────────────────
  // We override next() to detect when the last step finishes naturally.
  // The service's nextStep() calls endTour() when past the last step,
  // so we hook before that call.
  // Re-assign in template: (click)="onNextClick()"
  onNextClick(): void {
    const currentStep = this.stepsArray[this.currentStepIndex];
    if (currentStep?.stepId) {
      this.tourService.markStepsSeen(this.tourConfig.tourKey, [currentStep.stepId]);
    }

    if (currentStep?.clickOnNext) {
      const el = document.querySelector(currentStep.clickOnNext) as HTMLElement;
      if (el) {
        setTimeout(() => el.click(), 50);
      }
    }

    if (this.isLastStep) {
      this._onTourComplete();
    }
    this.tourService.nextStep();
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  private _disconnect(): void {
    this._tourSub?.unsubscribe();
    this._readySub?.unsubscribe();
    this._dialogWaitSub?.unsubscribe();
    clearTimeout(this._gracePollTimer);
    clearTimeout(this._stepDebounce);
    clearTimeout(this._miniTourDebounce);
    if (this._resizeListener) {
      window.removeEventListener('resize', this._resizeListener);
      window.removeEventListener('scroll', this._resizeListener, true);
    }
  }

  ngOnDestroy(): void {
    this._disconnect();
    this.tourService.unregisterRetakeAction();
    if (this.isActive) this.tourService.endTour();
  }
}
