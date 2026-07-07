import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
    launchOptions: {
      args: process.env.CI ? ['--no-sandbox'] : []
    }
  },
  webServer: {
    command: 'npm start -- --host 127.0.0.1 --port 4200',
    url: 'http://127.0.0.1:4200/items',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
