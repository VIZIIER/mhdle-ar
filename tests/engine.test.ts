import { describe, expect, it } from 'vitest';
import { MONSTERS, MONSTER_BY_ID, ALL_GAME_IDS } from '../src/data';
import { compareMonsters, compareNumber, compareRange, compareSets, allCorrect } from '../src/games/compare';
import { pickDaily, pickInfinite } from '../src/games/daily';
import { addDays, dayKey, dayNumber } from '../src/utils/day';
import { maskDescription } from '../src/games/mask';
import { poolFor } from '../src/games/modes';
import { normalize, searchMonsters } from '../src/games/search';
import { decodeSelection, encodeSelection } from '../src/persistence/settings';
import { classicGrid, parseChallenge } from '../src/games/share';
import { makeT } from '../src/i18n/I18nProvider';

const m = (id: string) => MONSTER_BY_ID.get(id)!;

describe('data', () => {
  it('has unique ids and both names for every monster', () => {
    expect(new Set(MONSTERS.map((x) => x.id)).size).toBe(MONSTERS.length);
    for (const x of MONSTERS) {
      expect(x.name.en).toBeTruthy();
      expect(x.name.ar).toMatch(/[؀-ۿ]/);
      expect(x.description.en.length).toBeGreaterThan(20);
    }
  });
});

describe('Classic comparisons', () => {
  it('compares sets: identical, overlap, disjoint, both empty', () => {
    expect(compareSets(['fire'], ['fire']).status).toBe('correct');
    expect(compareSets(['fire', 'dragon'], ['fire']).status).toBe('partial');
    expect(compareSets(['ice'], ['fire']).status).toBe('incorrect');
    expect(compareSets([], []).status).toBe('correct');
    expect(compareSets(['fire'], []).status).toBe('incorrect');
  });

  it('gives arrows towards the answer for numbers', () => {
    expect(compareNumber(1000, 2000)).toEqual({ status: 'incorrect', direction: 'higher' });
    expect(compareNumber(3000, 2000)).toEqual({ status: 'incorrect', direction: 'lower' });
    expect(compareNumber(2000, 2000).status).toBe('correct');
    expect(compareNumber(null, 2000).status).toBe('unknown');
  });

  it('treats overlapping threat ranges as partial', () => {
    expect(compareRange({ min: 5, max: 6 }, { min: 5, max: 6 }).status).toBe('correct');
    expect(compareRange({ min: 4, max: 5 }, { min: 5, max: 7 }).status).toBe('partial');
    expect(compareRange({ min: 2, max: 3 }, { min: 5, max: 7 })).toEqual({ status: 'incorrect', direction: 'higher' });
    expect(compareRange({ min: 8, max: 9 }, { min: 5, max: 7 })).toEqual({ status: 'incorrect', direction: 'lower' });
    expect(compareRange(null, { min: 5, max: 7 }).status).toBe('unknown');
  });

  it('a monster compared with itself is all correct', () => {
    for (const x of MONSTERS.slice(0, 40)) expect(allCorrect(compareMonsters(x, x))).toBe(true);
  });

  it('Rathalos vs Rathian behaves as expected', () => {
    const row = compareMonsters(m('rathian'), m('rathalos'));
    expect(row.classes.status).toBe('correct');
    expect(row.elements.status).toBe('partial'); // fire vs fire+dragon
    expect(row.generation.status).toBe('correct');
    expect(row.firstGame.status).toBe('correct');
  });

  it('unknown fields compare as unknown, never as wrong', () => {
    const row = compareMonsters(m('rathalos'), m('apex-diablos'));
    expect(row.weaknesses.status).toBe('unknown');
  });
});

describe('daily selection', () => {
  const pool = poolFor('classic', ALL_GAME_IDS);

  it('is deterministic for a day and mode', () => {
    expect(pickDaily(pool, '2026-10-18', 'classic')?.id).toBe(pickDaily(pool, '2026-10-18', 'classic')?.id);
  });

  it('does not depend on the order of the pool', () => {
    const shuffled = [...pool].reverse();
    expect(pickDaily(shuffled, '2026-10-18', 'classic')?.id).toBe(pickDaily(pool, '2026-10-18', 'classic')?.id);
  });

  it('gives different answers to different modes on most days', () => {
    let same = 0;
    for (let i = 0; i < 60; i++) {
      const d = addDays('2026-10-01', i);
      if (pickDaily(pool, d, 'classic')?.id === pickDaily(pool, d, 'compendium')?.id) same++;
    }
    expect(same).toBeLessThan(5);
  });

  it('never repeats a monster within one cycle of the pool', () => {
    const start = '2026-01-01';
    const seen = new Set<string>();
    // Find the first day of a cycle, then walk the whole cycle.
    let d = start;
    while (dayNumber(d) % pool.length !== 0) d = addDays(d, 1);
    for (let i = 0; i < pool.length; i++) seen.add(pickDaily(pool, addDays(d, i), 'classic')!.id);
    expect(seen.size).toBe(pool.length);
  });

  it('respects the game selection', () => {
    const wildsOnly = poolFor('classic', ['mhwilds']);
    for (let i = 0; i < 30; i++) {
      const pick = pickDaily(wildsOnly, addDays('2026-10-01', i), 'classic')!;
      expect(pick.games).toContain('mhwilds');
    }
  });

  it('infinite picks avoid recent answers', () => {
    const small = pool.slice(0, 3);
    const pick = pickInfinite(small, [small[0].id, small[1].id], 42);
    expect(pick?.id).toBe(small[2].id);
  });

  it('dayKey and dayNumber are consistent', () => {
    expect(dayKey(new Date(2026, 9, 18, 23, 59))).toBe('2026-10-18');
    expect(dayNumber('2026-10-19') - dayNumber('2026-10-18')).toBe(1);
    expect(addDays('2026-03-31', 1)).toBe('2026-04-01');
  });
});

describe('search', () => {
  const pool = MONSTERS;
  it('ranks prefix matches first', () => {
    const res = searchMonsters(pool, 'rath', 'en', new Set());
    expect(res[0].name.en.toLowerCase().startsWith('rath')).toBe(true);
  });
  it('finds monsters by Arabic name, tolerant of hamza forms', () => {
    expect(searchMonsters(pool, 'راثالوس', 'ar', new Set()).map((x) => x.id)).toContain('rathalos');
    expect(normalize('أجناكتور')).toBe(normalize('اجناكتور'));
    expect(searchMonsters(pool, 'اجناكتور', 'ar', new Set()).map((x) => x.id)).toContain('agnaktor');
  });
  it('finds Arabic names while the UI is in English and vice versa', () => {
    expect(searchMonsters(pool, 'زينوغري', 'en', new Set()).map((x) => x.id)).toContain('zinogre');
    expect(searchMonsters(pool, 'zino', 'ar', new Set()).map((x) => x.id)).toContain('zinogre');
  });
  it('hides already guessed monsters', () => {
    expect(searchMonsters(pool, 'zinogre', 'en', new Set(['zinogre'])).map((x) => x.id)).not.toContain('zinogre');
  });
  it('ignores apostrophes, hyphens and spacing', () => {
    const ids = (q: string) => searchMonsters(pool, q, 'en', new Set()).map((x) => x.id);
    for (const q of ['dahren', "dah'ren", 'dahren mohran', 'Dah’ren']) expect(ids(q)).toContain('dahren-mohran');
    for (const q of ['safijiiva', "safi'jiiva"]) expect(ids(q)).toContain('safijiiva');
    for (const q of ['kulu ya', 'kuluyaku', 'kulu-ya-ku']) expect(ids(q)).toContain('kulu-ya-ku');
    expect(ids('lao shan')).toContain('lao-shan-lung');
    expect(ids('laoshan')).toContain('lao-shan-lung');
  });

  it('every monster is found by its own English and Arabic name', () => {
    for (const m of pool) {
      expect(searchMonsters(pool, m.name.en, 'en', new Set(), 50).map((x) => x.id)).toContain(m.id);
      expect(searchMonsters(pool, m.name.ar, 'ar', new Set(), 50).map((x) => x.id)).toContain(m.id);
      expect(searchMonsters(pool, m.id.replace(/-/g, ' '), 'en', new Set(), 50).map((x) => x.id)).toContain(m.id);
    }
  });
});

describe('compendium masking', () => {
  it('hides the name and its parts in both languages', () => {
    const fake = { ...m('rathalos'), description: { en: 'Rathalos and Azure Rathalos fly.', ar: 'راثالوس يطير.' } };
    expect(maskDescription(fake.description.en, fake)).not.toMatch(/rathalos/i);
    expect(maskDescription(fake.description.ar, fake)).not.toContain('راثالوس');
  });
  it('leaves descriptions without the name untouched', () => {
    const r = m('rathalos');
    expect(maskDescription(r.description.en, r)).toBe(r.description.en);
  });
});

describe('share links', () => {
  it('round-trips the game selection', () => {
    const sel = ['mh1', 'mhw', 'mhwilds'];
    expect(decodeSelection(encodeSelection(sel))).toEqual(sel);
    expect(decodeSelection(encodeSelection(ALL_GAME_IDS))).toEqual(ALL_GAME_IDS);
    expect(decodeSelection('!!')).toBeNull();
  });
  it('only accepts challenges for today', () => {
    expect(parseChallenge('4-20261018', '2026-10-18')).toBe(4);
    expect(parseChallenge('4-20261017', '2026-10-18')).toBeNull();
    expect(parseChallenge('x', '2026-10-18')).toBeNull();
  });
  it('builds an emoji grid of at most five rows', () => {
    const rows = Array.from({ length: 7 }, () => ['correct', 'partial', 'incorrect'] as const).map((r) => [...r]);
    const g = classicGrid(rows);
    expect(g.lines).toHaveLength(5);
    expect(g.hidden).toBe(2);
    expect(g.lines[0]).toBe('🟩🟧🟥');
  });
});

describe('translations', () => {
  it('uses Arabic plural forms', () => {
    const { t } = makeT('ar');
    expect(t('game.tries', { count: 1 })).toBe('محاولة واحدة');
    expect(t('game.tries', { count: 2 })).toBe('محاولتان');
    expect(t('game.tries', { count: 5 })).toBe('5 محاولات');
    expect(t('game.tries', { count: 11 })).toBe('11 محاولة');
  });
  it('uses English plural forms and interpolation', () => {
    const { t } = makeT('en');
    expect(t('game.tries', { count: 1 })).toBe('1 try');
    expect(t('game.tries', { count: 3 })).toBe('3 tries');
    expect(t('win.answer', { name: 'Rathalos' })).toBe('The monster was Rathalos');
  });
});

describe('persistence', () => {
  it('discards corrupted rounds instead of crashing', async () => {
    const { sanitizeRound } = await import('../src/persistence/progress');
    expect(sanitizeRound(null)).toBeNull();
    expect(sanitizeRound({ day: 'yesterday', answerId: 'x', guesses: [] })).toBeNull();
    expect(sanitizeRound({ day: '2026-10-18', answerId: 'rathalos', guesses: 'oops' })).toBeNull();
    expect(sanitizeRound({ day: '2026-10-18', answerId: 'rathalos', guesses: ['a', 'a'], won: 'yes' })).toEqual({
      day: '2026-10-18', answerId: 'rathalos', guesses: ['a'], won: false, revealed: [], infinite: false,
    });
  });

  it('survives garbage in localStorage', async () => {
    localStorage.setItem('mhdle:v1:rounds', '{not json');
    localStorage.setItem('mhdle:v1:settings', '{"games":"all"}');
    const { loadModeRounds } = await import('../src/persistence/progress');
    const { loadSettings } = await import('../src/persistence/settings');
    expect(loadModeRounds('classic').daily).toBeNull();
    expect(loadSettings().games.length).toBe(18);
    localStorage.clear();
  });
});

describe('threat levels', () => {
  it('stay within the in-game 1–10 star scale', () => {
    for (const x of MONSTERS) if (x.threat) {
      expect(x.threat.min).toBeGreaterThanOrEqual(1);
      expect(x.threat.max).toBeLessThanOrEqual(10);
      expect(x.threat.min).toBeLessThanOrEqual(x.threat.max);
    }
  });
  it('uses the Hunter\'s Notes values researched for previously missing monsters', () => {
    const t = (id: string) => m(id).threat;
    expect(t('gaismagorm')).toEqual({ min: 10, max: 10 });
    expect(t('abyssal-lagiacrus')).toEqual({ min: 6, max: 6 });
    expect(t('sand-barioth')).toEqual({ min: 5, max: 5 });
    expect(t('savage-deviljho')).toEqual(t('deviljho'));
  });
  it('does not invent a fixed threat for Wilds-only monsters (Wilds rates each encounter)', () => {
    for (const id of ['balahara', 'doshaguma', 'nu-udra', 'rey-dau', 'arkveld']) expect(m(id).threat).toBeNull();
  });
});
