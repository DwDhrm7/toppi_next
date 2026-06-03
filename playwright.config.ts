import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // 1. Auth setup runs first (no storageState)
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    // 2. All other tests use the saved session
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/session.json',
      },
      dependencies: ['setup'],
    },
  ],
});
