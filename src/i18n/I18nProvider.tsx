import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import type { Lang } from '../data';
import { loadRaw, saveRaw } from '../persistence/storage';

type Dict = { [key: string]: string | Dict };
const DICTS: Record<Lang, Dict> = { en: en as Dict, ar: ar as Dict };
const PLURAL_KEYS = ['zero', 'one', 'two', 'few', 'many', 'other'];

export type Params = Record<string, string | number>;
export type TFunction = (key: string, params?: Params) => string;

interface I18nValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: TFunction;
  /** Formats a number for the current language (Arabic uses Western digits, as most Saudi game UIs do). */
  num: (n: number, opts?: Intl.NumberFormatOptions) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: Dict, key: string): string | Dict | undefined {
  return key.split('.').reduce<string | Dict | undefined>((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dict);
}

function detectInitial(): Lang {
  const saved = loadRaw('lang');
  if (saved === 'en' || saved === 'ar') return saved;
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function makeT(lang: Lang): { t: TFunction; num: I18nValue['num'] } {
  const locale = lang === 'ar' ? 'ar-u-nu-latn' : 'en';
  const plural = new Intl.PluralRules(lang);
  const num = (n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, opts).format(n);
  const t: TFunction = (key, params = {}) => {
    let node = lookup(DICTS[lang], key) ?? lookup(DICTS.en, key);
    if (node && typeof node === 'object') {
      const count = Number(params.count ?? 0);
      const cat = plural.select(count);
      const forms: Dict = node;
      node = forms[cat] ?? forms.other;
      if (node && typeof node === 'object') {
        const nested: Dict = node;
        if (PLURAL_KEYS.some((k) => k in nested)) node = undefined;
      }
    }
    if (typeof node !== 'string') {
      if (import.meta.env.DEV) console.warn(`[i18n] missing key ${key}`);
      return key;
    }
    return node.replace(/\{(\w+)\}/g, (_, name: string) => {
      const v = params[name];
      if (v === undefined) return `{${name}}`;
      return typeof v === 'number' ? num(v) : v;
    });
  };
  return { t, num };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    saveRaw('lang', l);
  }, []);

  const value = useMemo<I18nValue>(() => ({ lang, dir, setLang, ...makeT(lang) }), [lang, dir, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = value.t('app.docTitle');
  }, [lang, dir, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
