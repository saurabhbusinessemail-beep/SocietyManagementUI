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
      title: 'TOUR.USER_DASHBOARD.WELCOME_TITLE',
      content: 'TOUR.USER_DASHBOARD.WELCOME_CONTENT',
      position: 'bottom'
    },
    {
      stepId: 'join-section',
      target: '.user-container ui-form-layout:first-child',
      title: 'TOUR.USER_DASHBOARD.JOIN_SECTION_TITLE',
      content: 'TOUR.USER_DASHBOARD.JOIN_SECTION_CONTENT',
      position: 'top'
    },
    {
      stepId: 'join-card',
      target: 'ui-card:first-of-type',
      title: 'TOUR.USER_DASHBOARD.JOIN_CARD_TITLE',
      content: 'TOUR.USER_DASHBOARD.JOIN_CARD_CONTENT',
      position: 'bottom'
    },
    {
      stepId: 'societies-section',
      target: '.societies-section',
      title: 'TOUR.USER_DASHBOARD.SOCIETIES_SECTION_TITLE',
      content: 'TOUR.USER_DASHBOARD.SOCIETIES_SECTION_CONTENT',
      position: 'bottom'
    },
    {
      // Shown only when hasAnyApprovals === true
      stepId: 'approvals-section',
      target: '.approvals-section',
      title: 'TOUR.USER_DASHBOARD.APPROVALS_SECTION_TITLE',
      content: 'TOUR.USER_DASHBOARD.APPROVALS_SECTION_CONTENT',
      position: 'top'
    },
    {
      // Shown only when at least one approval card exists
      stepId: 'approval-card',
      target: '.approval-card-premium:first-of-type',
      title: 'TOUR.USER_DASHBOARD.APPROVAL_CARD_TITLE',
      content: 'TOUR.USER_DASHBOARD.APPROVAL_CARD_CONTENT',
      position: 'bottom',
      waitForElement: 200
    },
    {
      stepId: 'user-icon',
      target: '.user-btn',
      title: 'TOUR.USER_DASHBOARD.USER_ICON_TITLE',
      content: 'TOUR.USER_DASHBOARD.USER_ICON_CONTENT',
      position: 'bottom-right',
      clickOnNext: '.user-btn',
      nextButtonText: 'TOUR.USER_DASHBOARD.USER_ICON_NEXT_BUTTON'
    },
    {
      stepId: 'user-menu-info',
      target: '.user-info',
      title: 'TOUR.USER_DASHBOARD.USER_MENU_INFO_TITLE',
      content: 'TOUR.USER_DASHBOARD.USER_MENU_INFO_CONTENT',
      position: 'left',
      waitForElement: 300
    },
    {
      stepId: 'menu-register-society',
      target: '.register-society-item',
      title: 'TOUR.USER_DASHBOARD.REGISTER_SOCIETY_TITLE',
      content: 'TOUR.USER_DASHBOARD.REGISTER_SOCIETY_CONTENT',
      position: 'left'
    },
    {
      stepId: 'menu-request-demo',
      target: '.request-demo-item',
      title: 'TOUR.USER_DASHBOARD.REQUEST_DEMO_TITLE',
      content: 'TOUR.USER_DASHBOARD.REQUEST_DEMO_CONTENT',
      position: 'left'
    },
    {
      stepId: 'menu-profile-help',
      target: '.profile-help-item',
      targetAll: true,
      title: 'TOUR.USER_DASHBOARD.PROFILE_HELP_TITLE',
      content: 'TOUR.USER_DASHBOARD.PROFILE_HELP_CONTENT',
      position: 'left'
    },
    {
      stepId: 'menu-themes',
      target: '.theme-switcher-item',
      title: 'TOUR.USER_DASHBOARD.THEMES_TITLE',
      content: 'TOUR.USER_DASHBOARD.THEMES_CONTENT',
      position: 'left'
    }
  ]
};
