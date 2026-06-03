import { test as setup } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '.auth/session.json');
const e2eEmail = process.env.E2E_LOGIN_EMAIL;
const e2ePassword = process.env.E2E_LOGIN_PASSWORD;

setup('authenticate', async ({ page }) => {
  setup.setTimeout(60000);

  setup.skip(
    !e2eEmail || !e2ePassword,
    'Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD before running authenticated Playwright tests.'
  );

  await page.goto('/login');

  // Wait for the form to be ready
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', e2eEmail!);
  await page.fill('input[type="password"]', e2ePassword!);
  await page.click('button:has-text("Masuk")');

  // Wait until token appears in localStorage OR dashboard URL is reached
  await page.waitForFunction(() => {
    return !!localStorage.getItem('token') ||
           window.location.pathname.includes('/dashboard');
  }, { timeout: 45000 });

  // Navigate to dashboard explicitly if not already there
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  // Save the storage state (includes localStorage with token)
  await page.context().storageState({ path: authFile });
});
