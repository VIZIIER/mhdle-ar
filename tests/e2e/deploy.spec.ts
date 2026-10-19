import { expect, test } from '@playwright/test';
import { start } from './helpers';

test.describe('GitHub Pages sub-path deployment', () => {
  test('every request succeeds and stays under the repository path', async ({ page }) => {
    const failed: string[] = [];
    const outside: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.hostname === 'localhost' && !u.pathname.startsWith('/test-repo/')) outside.push(u.pathname);
      if (u.hostname !== 'localhost' && !u.protocol.startsWith('data')) outside.push(r.url());
    });
    await start(page);
    await page.goto('./#/classic');
    await page.goto('./#/compendium');
    await page.goto('./#/about');
    await page.waitForLoadState('networkidle');
    expect(failed, 'no 4xx/5xx responses').toEqual([]);
    expect(outside, 'no requests outside the repo path or to external hosts').toEqual([]);
  });

  test('fonts and styles actually load', async ({ page }) => {
    await start(page);
    await page.evaluate(() => document.fonts.ready);
    const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
    expect(fonts.join(',')).toMatch(/IBM Plex Sans Arabic/);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(20, 35, 29)');
  });

  for (const route of ['#/classic', '#/compendium', '#/about', '#/surveyor', '#/roar', '#/does-not-exist']) {
    test(`direct navigation and refresh work for ${route}`, async ({ page }) => {
      await start(page, route);
      await expect(page.locator('main h1')).toBeVisible();
      await page.reload();
      await expect(page.locator('main h1')).toBeVisible();
      expect(page.url()).toContain(`/test-repo/${route}`);
    });
  }

  test('modes without installed media explain why instead of breaking', async ({ page }) => {
    await start(page, '#/surveyor');
    await expect(page.locator('main h1')).toHaveText("This quest isn't installed");
  });
});
