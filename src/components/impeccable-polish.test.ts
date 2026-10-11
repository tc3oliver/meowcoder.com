import { describe, expect, it } from 'vitest';

import FOOTER from './Footer.astro?raw';
import LANGUAGE_SWITCHER from './LanguageSwitcher.astro?raw';
import SYSTEMS_RESEARCH from './home/SystemsResearchSection.astro?raw';
import SECTION_NAV from './work/SectionNav.astro?raw';

describe('Impeccable interface polish regressions', () => {
  it('keeps the desktop case-study contents visible without opening a disclosure', () => {
    expect(SECTION_NAV).toContain('class="section-nav__mobile"');
    expect(SECTION_NAV).toContain('class="section-nav__desktop"');
    expect(SECTION_NAV).toMatch(/\.section-nav__desktop\s*\{\s*display: none;/);
    expect(SECTION_NAV).toMatch(/\.section-nav__desktop\s*\{\s*display: block;/);
    expect(SECTION_NAV).toContain('class="section-nav__list" role="list"');
    expect(SECTION_NAV).not.toContain('.section-nav details:not([open])');
  });

  it('provides 44px mobile language and footer link hit areas', () => {
    for (const source of [LANGUAGE_SWITCHER, FOOTER]) {
      expect(source).toContain('min-height: 2.75rem');
      expect(source).toContain('display: inline-flex');
    }
    expect(LANGUAGE_SWITCHER).toContain('min-width: 2.75rem');
  });

  it('makes OSS project names scannable and marks external destinations', () => {
    expect(SYSTEMS_RESEARCH).toContain('class="upstream__external" aria-hidden="true"');
    expect(SYSTEMS_RESEARCH).toContain('grid-template-columns: 14rem minmax(0, 1fr)');
    expect(SYSTEMS_RESEARCH).toContain('font-size: var(--text-md)');
  });
});
