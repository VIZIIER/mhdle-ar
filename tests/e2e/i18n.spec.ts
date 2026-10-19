import { expect, test, type Page } from '@playwright/test';
import { guess, revealAnswer, setLanguage, start, wrongFor } from './helpers';

/**
 * Visible text in Arabic mode must not contain untranslated Latin words.
 * Allowed: the brand, the licence name, the language toggle, Latin edition letters in game names,
 * and English monster names that are deliberately shown as secondary labels (marked lang="en").
 */
async function latinLeaks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const allowed = /^(MH|DLE|CC|BY|SA|English|Enter|XX|Wilds|cm)$/;
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const el = node.parentElement!;
      if (el.closest('[lang="en"], script, style, noscript, .share-text')) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      for (const w of node.data.match(/[A-Za-z]{2,}/g) ?? []) if (!allowed.test(w)) out.push(`${w} (in <${el.tagName.toLowerCase()} class="${el.className}">)`);
    }
    return out;
  });
}

async function arabicLeaks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const el = node.parentElement!;
      if (el.closest('[lang="ar"], script, style, noscript')) continue;
      if (/[؀-ۿ]/.test(node.data)) out.push(node.data.trim());
    }
    return out;
  });
}

/** Folder and file names in the media setup instructions are intentionally left in Latin script. */
const FILE_WORDS = /^(public|media|images|audio|rathalos|webp|mp|Fandom)$/;

test.describe('localisation', () => {
  test('English is LTR, Arabic is RTL, and the choice persists', async ({ page }) => {
    await start(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await setLanguage(page, 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveTitle(/لعبة تخمين/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.home-title')).toHaveText('اعثر على وحوش اليوم');
  });

  test('switching language keeps the active round, guesses and hints', async ({ page }) => {
    await start(page, '#/compendium');
    const answer = await revealAnswer(page, 'compendium', 'rathalos');
    test.skip(answer === 'rathalos', 'probe was the answer');
    for (const w of wrongFor(answer, 4)) await guess(page, w);
    await page.getByRole('button', { name: 'Show the Class hint' }).click();
    const entryEn = await page.locator('.entry-text').innerText();
    await setLanguage(page, 'ar');
    await expect(page.locator('.guess')).toHaveCount(5);
    await expect(page.locator('.hint-open')).toHaveCount(1);
    const entryAr = await page.locator('.entry-text').innerText();
    expect(entryAr).not.toBe(entryEn);
    expect(entryAr).toMatch(/[؀-ۿ]/);
    await setLanguage(page, 'en');
    await expect(page.locator('.guess')).toHaveCount(5);
  });

  test('every screen is fully translated into Arabic', async ({ page }) => {
    await start(page);
    await setLanguage(page, 'ar');
    const leaks: Record<string, string[]> = {};
    leaks.home = await latinLeaks(page);

    await page.goto('./#/classic');
    const answer = await revealAnswer(page, 'classic', 'kirin');
    for (const w of wrongFor(answer, 2)) await guess(page, w);
    leaks.classic = await latinLeaks(page);
    if (!(await page.locator('.win').count())) await guess(page, answer);
    await expect(page.locator('.win')).toBeVisible();
    leaks.classicWin = await latinLeaks(page);

    await page.goto('./#/compendium');
    await guess(page, 'zinogre');
    leaks.compendium = await latinLeaks(page);

    await page.goto('./#/about');
    leaks.about = (await latinLeaks(page)).filter((w) => !FILE_WORDS.test(w.split(' ')[0]));

    await page.goto('./');
    await page.locator('.home-actions .btn').first().click();
    leaks.gamesDialog = await latinLeaks(page);
    await page.keyboard.press('Escape');
    await page.locator('.home-actions .btn').nth(1).click();
    leaks.statsDialog = await latinLeaks(page);

    await page.goto('./#/surveyor');
    leaks.unavailable = (await latinLeaks(page)).filter((w) => !FILE_WORDS.test(w.split(' ')[0]));

    for (const [screen, words] of Object.entries(leaks)) expect(words, `untranslated text on ${screen}`).toEqual([]);
  });

  test('English screens contain no stray Arabic', async ({ page }) => {
    await start(page);
    expect(await arabicLeaks(page)).toEqual([]);
    await page.goto('./#/classic');
    await guess(page, 'rathalos', 'راثالوس');
    expect(await arabicLeaks(page)).toEqual([]);
  });

  test('mixed-direction values render in the right order in Arabic', async ({ page }) => {
    await start(page);
    await setLanguage(page, 'ar');
    await page.goto('./#/classic');
    await guess(page, 'rathalos');
    const threat = page.locator('.board tbody tr').first().locator('td').nth(6).locator('.tile-text');
    await expect(threat).toHaveAttribute('dir', 'ltr');
    await expect(threat).toHaveText('5–6★');
    await expect(page.locator('.board tbody tr').first().locator('th')).toContainText('راثالوس');
  });
});
