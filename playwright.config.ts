import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the PRODUCTION build served from a repository sub-path,
// exactly like GitHub Pages serves https://<user>.github.io/<repo>/.
const SUBPATH = '/test-repo/';
const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}${SUBPATH}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --base ${SUBPATH}`,
    url: `http://localhost:${PORT}${SUBPATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
