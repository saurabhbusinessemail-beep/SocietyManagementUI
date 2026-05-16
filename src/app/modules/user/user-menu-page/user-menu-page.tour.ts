import { TourConfig } from '../../../interfaces/tour.model';

export const USER_MENU_TOUR: TourConfig = {
  tourKey: 'user_menu_v1',
  pageName: 'User Menu',
  steps: [
    {
      stepId: 'profile-info',
      target: '.dropdown-header',
      title: 'Profile Information',
      content: 'Here you can view your profile picture, name, and contact information. Click the edit icon to update your details.',
      position: 'bottom'
    },
    {
      stepId: 'society-dropdown',
      target: '.society-selector',
      title: 'Society Selection',
      content: 'This dropdown lets you switch between societies. Some menus below depend on the selected society and its privileges according to the selected pricing plan.',
      position: 'bottom'
    },
    {
      stepId: 'menu-dashboard',
      target: 'li[data-menu="Dashboard"]',
      title: 'Dashboard',
      content: 'Access the dashboard for quick access and overview of your account.',
      position: 'bottom',
      waitForElement: 200
    },
    {
      stepId: 'menu-dynamic-society-menus',
      target: 'li.menu-item[data-menu]:not([data-menu="Dashboard"]):not([data-menu="Pending Approval"])',
      targetAll: true,
      title: 'Society Menus',
      content: 'These menus are available based on the society you have selected and your privileges.',
      position: 'top',
      waitForElement: 200
    },
    {
      stepId: 'menu-approvals',
      target: 'li[data-menu="Pending Approval"]',
      title: 'Pending Approvals',
      content: 'View and manage approvals for gate entries, joining requests, and more for the selected society.',
      position: 'top',
      waitForElement: 200
    },
    {
      stepId: 'menu-register-society',
      target: '.register-society-item',
      title: 'Register Society',
      content: 'Register a new society here. It will go for approval along with other details provided.',
      position: 'top'
    },
    {
      stepId: 'menu-request-demo',
      target: '.request-demo-item',
      title: 'Request Demo',
      content: 'Want to see more features? Request a demo of the Gate My Society app.',
      position: 'top'
    },
    {
      stepId: 'menu-profile-help',
      target: '.profile-help-item',
      targetAll: true,
      title: 'Profile & Help',
      content: 'Manage your personal profile settings and get help or support if you need assistance.',
      position: 'top'
    },
    {
      stepId: 'menu-themes',
      target: '.theme-switcher-item',
      title: 'Themes',
      content: 'Customize the look of your app by choosing your favorite color theme.',
      position: 'top'
    }
  ]
};
