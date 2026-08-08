import type { Locale } from '../locales';
import { chromeEn } from './en';
import type { ChromeDictionary } from './types';
import { chromeZh } from './zh';

/** Shared site chrome, one dictionary per locale. */
export const chrome: Record<Locale, ChromeDictionary> = {
  en: chromeEn,
  zh: chromeZh,
};

export type { ChromeDictionary };
