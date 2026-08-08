import { describe, expect, it } from 'vitest';

import { chrome } from './chrome';
import { LOCALES } from './locales';
import { about } from './pages/about';
import { home } from './pages/home';
import { work } from './pages/work';

/** Sorted dot-paths of every leaf in an object, for structural comparison. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];

  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe('locale dictionaries', () => {
  it('give every locale the same chrome key structure', () => {
    const [reference, ...rest] = LOCALES.map((locale) => keyPaths(chrome[locale]));

    for (const other of rest) {
      expect(other).toEqual(reference);
    }
  });

  it.each([
    ['home', home],
    ['work', work],
    ['about', about],
  ])('gives every locale the same key structure for the %s page', (_name, dictionary) => {
    const [reference, ...rest] = LOCALES.map((locale) => keyPaths(dictionary[locale]));

    for (const other of rest) {
      expect(other).toEqual(reference);
    }
  });

  it('leaves no string empty in any locale', () => {
    for (const locale of LOCALES) {
      for (const dictionary of [chrome[locale], home[locale], work[locale], about[locale]]) {
        for (const value of Object.values(dictionary).flatMap((v) =>
          typeof v === 'object' && v !== null ? Object.values(v) : [v],
        )) {
          expect(String(value).trim()).not.toBe('');
        }
      }
    }
  });
});

describe('primary navigation (PRD §8)', () => {
  const NAV_ENTRIES = ['work', 'writing', 'about', 'github'] as const;

  it('contains exactly the four entries PRD §8 lists', () => {
    for (const locale of LOCALES) {
      const entries = Object.keys(chrome[locale].nav).filter(
        (key) => key !== 'ariaLabel' && key !== 'externalIndicator',
      );

      expect(entries.sort()).toEqual([...NAV_ENTRIES].sort());
    }
  });

  it('does not introduce a top-level entry PRD §8 forbids', () => {
    const FORBIDDEN = [
      'blog',
      'notes',
      'categories',
      'tags',
      'archive',
      'skills',
      'certifications',
      'research',
      'resume',
    ];

    for (const locale of LOCALES) {
      const keys = Object.keys(chrome[locale].nav).map((key) => key.toLowerCase());

      for (const forbidden of FORBIDDEN) {
        expect(keys).not.toContain(forbidden);
      }
    }
  });

  it('labels each language in its own language (PRD §8: EN / 中文)', () => {
    for (const locale of LOCALES) {
      expect(chrome[locale].languageSwitch.en).toBe('EN');
      expect(chrome[locale].languageSwitch.zh).toBe('中文');
    }
  });

  it('leaves proper names untranslated (PRD §7)', () => {
    for (const locale of LOCALES) {
      expect(chrome[locale].brand).toBe('Oliver Yu');
      expect(chrome[locale].nav.github).toBe('GitHub');
    }
  });
});

describe('homepage SEO strings (PRD §30)', () => {
  it('matches the English wording the PRD specifies verbatim', () => {
    expect(home.en.title).toBe('Oliver Yu — AI Systems Engineer & System Architect');
    expect(home.en.description).toBe(
      'AI Systems Engineer and System Architect with 10+ years of software engineering experience, building AI systems, developer tooling, model infrastructure, and production software.',
    );
  });

  it('matches the Chinese wording the PRD specifies verbatim', () => {
    expect(home.zh.title).toBe('Oliver Yu — AI 系統工程師與系統架構師');
    expect(home.zh.description).toBe(
      '擁有 10+ 年軟體工程經驗的 AI 系統工程師與系統架構師，專注於 AI 系統、開發者工具、模型基礎架構與正式產品開發。',
    );
  });

  it('gives every page a distinct title per locale', () => {
    for (const locale of LOCALES) {
      const titles = [home[locale].title, work[locale].title, about[locale].title];

      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});
