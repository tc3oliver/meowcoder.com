import { describe, expect, it } from 'vitest';

import { LOCALES } from '../locales';
import { about, type AboutStrings } from './about';

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).flatMap(strings);
}

const BY_LOCALE = LOCALES.map((locale) => [locale, about[locale]] as const);

describe.each(BY_LOCALE)('About content (%s)', (_locale, t: AboutStrings) => {
  it('builds the requested career and evidence structure', () => {
    expect(t.role).toBeTruthy();
    expect(t.summary).toHaveLength(2);
    expect(t.career.stages).toHaveLength(3);
    expect(t.career.href).toMatch(/^\/(zh\/)?work\/professional-engineering\/$/);
    expect(t.focus.items).toHaveLength(4);
    expect(t.research.areas).toHaveLength(4);
    expect(t.credentials.items).toHaveLength(2);
    expect(t.principles.items).toHaveLength(6);
  });

  it('includes the complete publication record and DOI', () => {
    expect(t.research.venue).toContain('2026');
    expect(t.research.record).toBe('Volume 99 · Article 104422');
    expect(t.research.href).toBe('https://doi.org/10.1016/j.jisa.2026.104422');
  });

  it('keeps low-value course completions and inflated credential wording out', () => {
    const FORBIDDEN = [/\bPMP\b/i, /Kubernetes Engine/i, /\bGKE\b/i, /Specialist Level/i, /專業級/];

    for (const pattern of FORBIDDEN) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });

  it('discloses no résumé, employer, or internal system', () => {
    const FORBIDDEN = [
      /\.pdf\b/i,
      /\br[ée]sum[ée]\b/i,
      /\bcurriculum vitae\b/i,
      /履歷/,
      /\bInc\.?\b/,
      /\bLtd\.?\b/,
      /股份有限公司/,
    ];

    for (const pattern of FORBIDDEN) {
      expect(strings(t).filter((value) => pattern.test(value))).toEqual([]);
    }
  });
});

describe('bilingual parity', () => {
  it('uses equivalent content counts and the correct localized career route', () => {
    expect(about.en.focus.items).toHaveLength(about.zh.focus.items.length);
    expect(about.en.research.areas).toHaveLength(about.zh.research.areas.length);
    expect(about.en.credentials.items).toHaveLength(about.zh.credentials.items.length);
    expect(about.en.career.href).toBe('/work/professional-engineering/');
    expect(about.zh.career.href).toBe('/zh/work/professional-engineering/');
  });

  it('keeps publication identity equivalent across locales', () => {
    expect(about.en.research.paper).toBe(about.zh.research.paper);
    expect(about.en.research.venue).toBe(about.zh.research.venue);
    expect(about.en.research.record).toBe(about.zh.research.record);
    expect(about.en.research.href).toBe(about.zh.research.href);
  });
});

describe('credential wording', () => {
  it('uses the source credential name without Specialist Level', () => {
    expect(about.en.credentials.items[0]?.name).toBe('AI應用規劃師（機器學習）— 中級能力鑑定');
    expect(about.zh.credentials.items[0]?.name).toBe('AI應用規劃師（機器學習）－中級能力鑑定');
    expect(about.en.credentials.items[0]).not.toHaveProperty('note');
    expect(about.zh.credentials.items[0]).not.toHaveProperty('note');
  });
});

describe('core positioning', () => {
  it('preserves the English principles and professional identity', () => {
    expect(about.en.role).toBe('AI Systems Engineer · System Architect');
    expect(about.en.intro).toContain('10+ years');
    expect(about.en.principles.statement).toBe(
      'Reliable AI systems require more than capable models.',
    );
    expect(about.en.principles.items).toEqual([
      'Traceable',
      'Testable',
      'Observable',
      'Permission-aware',
      'Replaceable',
      'Recoverable',
    ]);
  });

  it('preserves the natural Chinese principles and professional identity', () => {
    expect(about.zh.role).toBe('AI 系統工程師 · 系統架構師');
    expect(about.zh.intro).toContain('10+ 年');
    expect(about.zh.principles.statement).toBe('可靠的 AI 系統，靠的不只是夠強的模型。');
  });
});
