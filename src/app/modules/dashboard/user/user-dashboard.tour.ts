// user-dashboard.tour.ts
// Tour configuration for the Dashboard → User page.
// Each step's `target` is a CSS selector that MUST match an element in the DOM.
//
// Steps that depend on runtime data carry a `stepId`. The UserComponent will
// pass `excludeStepIds` to <app-tour-overlay> to skip steps for missing data.

import { TourConfig } from '../../../interfaces/tour.model';

export const USER_DASHBOARD_TOUR: TourConfig = {
  tourKey: 'dashboard_user_v1',
  pageName: 'My Dashboard',
  steps: [
    {
      stepId: 'welcome',
      target: '.banner-container',
      title: '👋 Welcome to Your Dashboard!',
      content:
        'This is your personal hub. From here you can join societies, manage your flats, and take care of pending actions.',
      position: 'bottom'
    },
    {
      stepId: 'join-section',
      target: '.user-container ui-form-layout:first-child',
      title: '🏡 Join a Society',
      content:
        'Choose how you want to join – as a Flat Owner, Tenant, or Security personnel. Click any card to begin the registration process.',
      position: 'bottom'
    },
    {
      stepId: 'join-card',
      target: 'ui-card:first-of-type',
      title: '🔑 Flat Owner',
      content:
        'Select this if you own a flat in a society. You\'ll be able to manage rent, maintenance and more.',
      position: 'bottom'  // ← changed from 'right' to avoid tooltip hiding off-screen on mobile
    },
    {
      stepId: 'societies-section',
      target: '.societies-section',
      title: '🏢 Your Societies',
      content:
        'All the societies you are part of appear here as circular badges. Tap any society to open its dashboard.',
      position: 'top'
    },
    {
      // Shown only when hasAnyApprovals === true
      stepId: 'approvals-section',
      target: '.approvals-section',
      title: '🔔 Pending Actions',
      content:
        'Any items that need your attention – gate entry approvals, join requests, rent or maintenance payments – are shown here with a premium card view.',
      position: 'top'
    },
    {
      // Shown only when at least one approval card exists
      stepId: 'approval-card',
      target: '.approval-card-premium:first-of-type',
      title: '📋 Approval Card',
      content:
        'Click any card to navigate directly to that item. Each card shows the type, status and a one-tap action.',
      position: 'bottom',
      waitForElement: 200
    }
  ]
};
