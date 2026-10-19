import { expect, test } from '@playwright/test';
import { guess, setLanguage, start } from './helpers';

for (const lang of ['en', 'ar'] as const) {
  test(`no horizontal page overflow (${lang})`, async ({ page }) => {
    await start(page);
    await setLanguage(page, lang);
    for (const route of ['./', './#/classic', './#/compendium', './#/about']) {
      await page.goto(route);
      if (route.endsWith('classic')) {
        await guess(page, 'rathalos');
        await guess(page, 'zinogre');
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} overflows`).toBeLessThanOrEqual(1);
    }
  });
}

test('quest board and search box are usable at this viewport', async ({ page }) => {
  await start(page);
  for (const card of await page.locator('.quest').all()) {
    const box = (await card.boundingBox())!;
    expect(box.width).toBeGreaterThan(200);
  }
  await page.goto('./#/classic');
  const input = page.locator('.search-input');
  await input.fill('rath');
  const list = page.locator('.search-list');
  await expect(list).toBeVisible();
  const vw = page.viewportSize()!.width;
  const lb = (await list.boundingBox())!;
  expect(lb.x).toBeGreaterThanOrEqual(0);
  expect(lb.x + lb.width).toBeLessThanOrEqual(vw + 1);
});
