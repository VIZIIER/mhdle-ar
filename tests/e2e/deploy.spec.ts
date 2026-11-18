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
    await page.goto('./#/surveyor');
    await expect(page.locator('.survey-img')).toBeVisible();
    await page.goto('./#/roar');
    await expect(page.locator('.player')).toBeVisible();
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
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(7, 20, 48)');
  });

  for (const route of ['#/classic', '#/compendium', '#/surveyor', '#/roar', '#/about', '#/does-not-exist']) {
    test(`direct navigation and refresh work for ${route}`, async ({ page }) => {
      await start(page, route);
      await expect(page.locator('main h1')).toBeVisible();
      await page.reload();
      await expect(page.locator('main h1')).toBeVisible();
      expect(page.url()).toContain(`/test-repo/${route}`);
    });
  }

  test('monster icons, pictures and roars are served from the repository path', async ({ page }) => {
    await start(page, '#/classic');
    await page.locator('.search-input').fill('rathalos');
    const icon = page.locator('[role="option"][data-id="rathalos"] img.badge-img');
    await expect(icon).toBeVisible();
    await expect.poll(() => icon.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    expect(await icon.getAttribute('src')).toContain('media/icons/rathalos.');

    await page.goto('./#/surveyor');
    const picture = page.locator('.survey-img');
    await expect.poll(() => picture.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

    await page.goto('./#/roar');
    const audio = page.locator('.player audio');
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.duration || 0)).toBeGreaterThan(0);
  });
});
