import { TourConfig } from '../../../interfaces/tour.model';

export const USER_MENU_TOUR: TourConfig = {
  tourKey: 'user_menu_v1',
  pageName: 'User Menu',
  steps: [
    {
      stepId: 'profile-info',
      target: '.dropdown-header',
      title: 'TOUR.USER_MENU.PROFILE_INFO_TITLE',
      content: 'TOUR.USER_MENU.PROFILE_INFO_CONTENT',
      position: 'bottom'
    },
    {
      stepId: 'society-dropdown',
      target: '.society-selector',
      title: 'TOUR.USER_MENU.SOCIETY_DROPDOWN_TITLE',
      content: 'TOUR.USER_MENU.SOCIETY_DROPDOWN_CONTENT',
      position: 'bottom'
    },
    {
      stepId: 'menu-dashboard',
      target: 'li[data-menu="Dashboard"]',
      title: 'TOUR.USER_MENU.DASHBOARD_TITLE',
      content: 'TOUR.USER_MENU.DASHBOARD_CONTENT',
      position: 'bottom',
      waitForElement: 200
    },
    {
      stepId: 'menu-dynamic-society-menus',
      target: 'li.menu-item[data-menu]:not([data-menu="Dashboard"]):not([data-menu="Pending Approval"])',
      targetAll: true,
      title: 'TOUR.USER_MENU.SOCIETY_MENUS_TITLE',
      content: 'TOUR.USER_MENU.SOCIETY_MENUS_CONTENT',
      position: 'top',
      waitForElement: 200
    },
    {
      stepId: 'menu-approvals',
      target: 'li[data-menu="Pending Approval"]',
      title: 'TOUR.USER_MENU.PENDING_APPROVALS_TITLE',
      content: 'TOUR.USER_MENU.PENDING_APPROVALS_CONTENT',
      position: 'top',
      waitForElement: 200
    },
    {
      stepId: 'menu-register-society',
      target: '.register-society-item',
      title: 'TOUR.USER_MENU.REGISTER_SOCIETY_TITLE',
      content: 'TOUR.USER_MENU.REGISTER_SOCIETY_CONTENT',
      position: 'top'
    },
    {
      stepId: 'menu-request-demo',
      target: '.request-demo-item',
      title: 'TOUR.USER_MENU.REQUEST_DEMO_TITLE',
      content: 'TOUR.USER_MENU.REQUEST_DEMO_CONTENT',
      position: 'top'
    },
    {
      stepId: 'menu-profile-help',
      target: '.profile-help-item',
      targetAll: true,
      title: 'TOUR.USER_MENU.PROFILE_HELP_TITLE',
      content: 'TOUR.USER_MENU.PROFILE_HELP_CONTENT',
      position: 'top'
    },
    {
      stepId: 'menu-themes',
      target: '.theme-switcher-item',
      title: 'TOUR.USER_MENU.THEMES_TITLE',
      content: 'TOUR.USER_MENU.THEMES_CONTENT',
      position: 'top'
    }
  ]
};
