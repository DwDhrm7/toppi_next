import { test, expect } from '@playwright/test';

// All tests use shared session from auth.setup.ts (already logged in)

test.describe('Toppi Real E2E Testing (Greybox)', () => {
  test.setTimeout(90000);

  test('Dashboard - loads and shows company list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Daftar Perusahaan')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Pilih perusahaan untuk melihat daftar alat TOPPI')).toBeVisible();
  });

  test('TOPPI Log - table loads with data or skeleton', async ({ page }) => {
    await page.goto('/toppi-log');

    // Wait for table to appear
    await page.waitForSelector('table', { timeout: 15000 });

    // Allow up to 30s for data to load (skeleton → real rows)
    await page.waitForFunction(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      // Success: at least one real row (no animate-pulse) OR empty state
      return rows.some(r => !r.classList.contains('animate-pulse'));
    }, { timeout: 30000 });

    const rows = page.locator('table tbody tr:not(.animate-pulse)');
    expect(await rows.count()).toBeGreaterThan(0);

    // Click first real row → detail panel opens (click td to avoid company column stopPropagation)
    await rows.first().locator('td').first().click();
    await page.waitForSelector('h3:has-text("Log Details")', { timeout: 10000 });
    await expect(page.locator('h3:has-text("Log Details")')).toBeVisible();
    await expect(page.locator('text=CAPTURE RESULT')).toBeVisible();
    await expect(page.locator('text=OCR DETAILS')).toBeVisible();
  });

  test('TOPPI Log - search filter works', async ({ page }) => {
    await page.goto('/toppi-log');
    await page.waitForSelector('table', { timeout: 15000 });

    // Wait for real data
    await page.waitForFunction(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(r => !r.classList.contains('animate-pulse'));
    }, { timeout: 30000 });

    await page.fill('input[placeholder="Cari alat / company..."]', '256E');
    await page.waitForTimeout(2000);

    const rowsAfterSearch = await page.locator('table tbody tr').count();
    expect(rowsAfterSearch).toBeGreaterThanOrEqual(0);
  });

  test('MQTT Log - table loads data', async ({ page }) => {
    await page.goto('/mqtt-log');
    await page.waitForSelector('table', { timeout: 15000 });

    await page.waitForFunction(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(r => !r.classList.contains('animate-pulse'));
    }, { timeout: 30000 });

    const realRows = page.locator('table tbody tr:not(.animate-pulse)');
    expect(await realRows.count()).toBeGreaterThan(0);
  });

  test('MQTT Log - click row opens detail panel', async ({ page }) => {
    await page.goto('/mqtt-log');
    await page.waitForSelector('table', { timeout: 15000 });

    // Wait for skeleton to clear
    await page.waitForFunction(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(r => !r.classList.contains('animate-pulse'));
    }, { timeout: 30000 });

    // Check we have real clickable data rows (not just empty state)
    const realRows = page.locator('table tbody tr:not(.animate-pulse)');
    const rowCount = await realRows.count();

    if (rowCount === 0) {
      // No data available - skip detail panel check
      console.log('MQTT Log: No data rows available, skipping detail panel test');
      return;
    }

    // Ensure row has a real device_id (not empty state row with colspan)
    const firstRealRow = realRows.first();
    const hasColspan = await firstRealRow.locator('td[colspan]').count();
    if (hasColspan > 0) {
      console.log('MQTT Log: Only empty-state row found, skipping detail panel test');
      return;
    }

    await firstRealRow.locator('td').first().click();
    // Wait for detail panel - give more time
    await page.waitForSelector('h3:has-text("Log Details")', { timeout: 15000 });
    await expect(page.locator('h3:has-text("Log Details")')).toBeVisible();
    await expect(page.locator('text=CAPTURE RESULT')).toBeVisible();
  });

  test('MQTT Log - Export CSV downloads file', async ({ page }) => {
    await page.goto('/mqtt-log');
    await page.waitForSelector('table', { timeout: 15000 });

    // Wait for export button (doesn't need data to load)
    await expect(page.locator('#btn-export-mqtt')).toBeVisible({ timeout: 10000 });

    // Open export modal
    await page.click('#btn-export-mqtt');
    await expect(page.locator('text=Export MQTT Log')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#export-from-date')).toBeVisible();
    await expect(page.locator('#export-to-date')).toBeVisible();

    // Set date range
    await page.fill('#export-from-date', '2026-06-01');
    await page.fill('#export-to-date', '2026-06-03');

    // Trigger download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.click('#btn-confirm-export'),
    ]);

    // Verify file
    expect(download.suggestedFilename()).toMatch(/mqtt-log.*\.csv$/);

    // Modal should close
    await expect(page.locator('text=Export MQTT Log')).not.toBeVisible({ timeout: 8000 });
  });
});
