import { expect, test } from '@playwright/test';
import { guess, revealAnswer, rounds, start, wrongFor } from './helpers';
import data from '../../src/data/monsters.json' with { type: 'json' };

const MONSTERS = (data as { monsters: { id: string; games: string[] }[] }).monsters;

test.describe('gameplay', () => {
  test('first visit asks for the game selection and the home board lists the modes', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('dialog[open] h2')).toHaveText('Hunter, prepare your quests!');
    await page.locator('dialog[open] .btn-primary').click();
    await expect(page.locator('.quest-name')).toHaveText(['Classic', 'Compendium']);
  });

  test('Classic: wrong guesses add coloured rows, the answer wins, results persist', async ({ page }) => {
    await start(page, '#/classic');
    const answer = await revealAnswer(page, 'classic');
    const wrong = wrongFor(answer, 2);
    for (const w of wrong) await guess(page, w);
    const rows = page.locator('.board tbody tr');
    const before = await rows.count();
    expect(before).toBeGreaterThanOrEqual(2);
    // every row has 9 attribute tiles, each with a status class
    for (const cls of await rows.first().locator('td').evaluateAll((tds) => tds.map((td) => td.className))) {
      expect(cls).toMatch(/tile-(correct|partial|incorrect|unknown)/);
    }
    await expect(rows.first().locator('td')).toHaveCount(9);

    // a repeated guess is not offered again
    await page.locator('.search-input').fill(wrong[0].replace(/-/g, ' '));
    await expect(page.locator(`[role="option"][data-id="${wrong[0]}"]`)).toHaveCount(0);
    await page.locator('.search-input').fill('');

    if (!(await page.locator('.win').count())) await guess(page, answer);
    await expect(page.locator('.win h2')).toHaveText('Quest complete!');
    await expect(page.locator('.win-answer')).toContainText('The monster was');
    // winning row is all green
    await expect(page.locator('.board tbody tr').first().locator('td.tile-correct')).toHaveCount(9);
    await expect(page.locator('.share-text')).toContainText('#/classic?s=');

    await page.reload();
    await expect(page.locator('.win')).toBeVisible();
    await page.goto('./');
    await expect(page.locator('.quest-cleared .quest-name')).toHaveText('Classic');
    const stats = JSON.parse((await page.evaluate(() => localStorage.getItem('mhdle:v1:stats'))) ?? '{}');
    expect(stats.classic.wins).toBe(1);
  });

  test('infinite mode gives new rounds repeatedly and does not count as daily wins', async ({ page }) => {
    await start(page, '#/classic');
    const daily = await revealAnswer(page, 'classic');
    if (!(await page.locator('.win').count())) await guess(page, daily);
    const seen = new Set([daily]);
    let startBtn = page.locator('.win-actions .btn').first();
    for (let i = 0; i < 3; i++) {
      await startBtn.click();
      await expect(page.locator('.pill')).toBeVisible();
      const ans = (await rounds(page)).classic.infinite!.answerId;
      expect(seen.has(ans)).toBe(false);
      seen.add(ans);
      await guess(page, ans);
      await expect(page.locator('.win h2')).toBeVisible();
      startBtn = page.locator('.win-actions .btn-primary');
    }
    const stats = JSON.parse((await page.evaluate(() => localStorage.getItem('mhdle:v1:stats'))) ?? '{}');
    expect(stats.classic.wins).toBe(1);
    expect(stats.classic.infiniteWins).toBe(3);
    await page.getByRole('button', { name: "Back to today's result" }).click();
    await expect(page.locator('.pill')).toHaveCount(0);
  });

  test('Compendium: masked entry, hints unlock at 5 and 10 wrong guesses', async ({ page }) => {
    await start(page, '#/compendium');
    await expect(page.locator('.entry-text')).not.toBeEmpty();
    const answer = await revealAnswer(page, 'compendium', 'rathalos');
    test.skip(answer === 'rathalos', 'probe happened to be the answer');
    const name = await page.evaluate((id) => id, answer);
    await expect(page.locator('.entry-text')).not.toContainText(new RegExp(name.split('-')[0], 'i'));
    await expect(page.locator('.hint-locked').first()).toContainText('4 more wrong guesses before the Class hint');
    for (const w of wrongFor(answer, 4)) await guess(page, w);
    await page.getByRole('button', { name: 'Show the Class hint' }).click();
    await expect(page.locator('.hint-open')).toContainText('Class');
    for (const w of wrongFor(answer, 9).slice(4)) await guess(page, w);
    await page.getByRole('button', { name: 'Show the Nickname hint' }).click();
    await expect(page.locator('.hint-open')).toHaveCount(2);
    await page.reload();
    await expect(page.locator('.hint-open')).toHaveCount(2);
    await expect(page.locator('.guess')).toHaveCount(10);
  });

  test('search: keyboard navigation, Arabic names, no match message', async ({ page }) => {
    await start(page, '#/classic');
    const input = page.locator('.search-input');
    await input.fill('rath');
    await expect(page.locator('[role="option"]').first()).toContainText('Rathalos');
    await input.press('ArrowDown');
    await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
    await input.fill('زينوغري');
    await expect(page.locator('[role="option"][data-id="zinogre"]')).toBeVisible();
    await input.fill('qqqq');
    await expect(page.locator('.search-empty')).toContainText('No monster');
  });

  test('game selection limits answers and search, and persists', async ({ page }) => {
    await start(page);
    await page.locator('.home-actions .menu-item').first().click();
    const dialog = page.locator('dialog[open]');
    await dialog.locator('.check-all input').uncheck();
    await expect(dialog.locator('.btn-primary')).toBeDisabled();
    await dialog.getByLabel('Monster Hunter Wilds').check();
    await dialog.locator('.btn-primary').click();
    await page.reload();
    await expect(page.locator('.home-meta')).toContainText('1 game selected');
    await page.goto('./#/classic');
    await page.locator('.search-input').fill('kirin');
    await expect(page.locator('.search-empty')).toBeVisible(); // Kirin isn't in Wilds
    const answer = await revealAnswer(page, 'classic', 'arkveld');
    const games = MONSTERS.find((m) => m.id === answer)!.games;
    expect(games).toContain('mhwilds');
  });

  test('share link: adopt the friend selection and see the challenge', async ({ page }) => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    await page.goto(`./#/classic?s=3&c=4-${ymd}`);
    await expect(page.locator('dialog[open] h2')).toHaveText("Play with your friend's games?");
    await page.getByRole('button', { name: 'Use their games' }).click();
    await expect(page.locator('.challenge')).toContainText('4 tries');
    const settings = JSON.parse((await page.evaluate(() => localStorage.getItem('mhdle:v1:settings'))) ?? '{}');
    expect(settings.games).toEqual(['mh1', 'mhg']);
  });

  test('statistics dialog shows persisted values', async ({ page }) => {
    await start(page);
    await page.locator('.home-actions .menu-item').nth(1).click();
    await expect(page.locator('dialog[open] h2')).toHaveText("Hunter's record");
    await expect(page.locator('.stats-table tbody tr')).toHaveCount(2);
  });
});
