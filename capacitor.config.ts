import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saurabhkumarbusiness.societymanagement',
  appName: 'NestNet',
  webDir: 'dist/society-management-ui/browser',
  server: {
    androidScheme: 'https'
  },
};

export default config;
