// Copyright © 2025 SHIELD Intelligence. All rights reserved.
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shieldintelligence.authenticator',
  appName: 'shield-authenticator',
  webDir: 'build',
  server: {
    url: "http://192.168.1.20:3000",
    cleartext: true
  }
};

export default config;
