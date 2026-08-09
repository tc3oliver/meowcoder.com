import type { Locale } from '../i18n/locales';

import { absoluteUrl } from './site';

export interface SocialPreview {
  src: string;
  alt: string;
  width: 1200;
  height: 630;
}

type SocialPreviewName = 'default' | 'shouri' | 'ai-coding-skills';

const ALT: Record<SocialPreviewName, Record<Locale, string>> = {
  default: {
    en: 'Oliver Yu — AI Systems Engineer and System Architect',
    zh: 'Oliver Yu — AI 系統工程師與系統架構師',
  },
  shouri: {
    en: 'Shouri product interface — an AI information organizer by Oliver Yu',
    zh: 'Shouri／收理產品介面 — Oliver Yu 打造的 AI 資訊整理工具',
  },
  'ai-coding-skills': {
    en: 'AI Coding Skills workflow from requirements through planning, execution, validation, and completion',
    zh: 'AI Coding Skills 從需求、規劃、執行、驗證到完成的工作流程',
  },
};

export function socialPreview(locale: Locale, name: SocialPreviewName = 'default'): SocialPreview {
  return {
    src: absoluteUrl(`/og/${name}-${locale}.png`),
    alt: ALT[name][locale],
    width: 1200,
    height: 630,
  };
}
