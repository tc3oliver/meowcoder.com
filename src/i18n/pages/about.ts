import type { Locale } from '../locales';
import type { PageStrings } from './types';

export interface Credential {
  name: string;
  meta: string;
  note?: string;
}

export interface AboutStrings extends PageStrings {
  eyebrow: string;
  role: string;
  summary: readonly string[];
  career: {
    heading: string;
    label: string;
    stages: readonly string[];
    summary: string;
    cta: string;
    href: string;
  };
  focus: {
    heading: string;
    items: readonly {
      name: string;
      description: string;
    }[];
  };
  research: {
    heading: string;
    venue: string;
    record: string;
    paper: string;
    detail: string;
    areasLabel: string;
    areas: readonly string[];
    cta: string;
    href: string;
  };
  education: {
    heading: string;
    degree: string;
    institution: string;
  };
  credentials: {
    heading: string;
    items: readonly Credential[];
  };
  principles: {
    heading: string;
    statement: string;
    items: readonly string[];
  };
}

export type AboutDictionary = Record<Locale, AboutStrings>;

const PUBLICATION_URL = 'https://doi.org/10.1016/j.jisa.2026.104422';

export const about = {
  en: {
    title: 'About Oliver Yu — AI Systems Engineer & System Architect',
    description:
      'Oliver Yu is an AI systems engineer and system architect with 10+ years of experience across software, cloud, architecture, security, and AI systems.',
    eyebrow: 'About Oliver',
    heading: 'Oliver Yu',
    role: 'AI Systems Engineer · System Architect',
    intro: '10+ years of software engineering experience, based in Taiwan.',
    summary: [
      'My background spans enterprise systems, cloud platforms, mobile and web applications, software security, machine learning, and AI systems.',
      'I now focus on AI infrastructure, agentic developer systems, knowledge systems, and production AI applications.',
    ],
    career: {
      heading: 'Career',
      label: '10+ Years',
      stages: ['Software Engineering', 'System Architecture', 'AI Systems'],
      summary:
        'My scope progressed from application and enterprise engineering to platform architecture and the delivery of production AI systems.',
      cta: 'Explore Professional Engineering Experience',
      href: '/work/professional-engineering/',
    },
    focus: {
      heading: 'Engineering Focus',
      items: [
        {
          name: 'AI Systems',
          description: 'Agent systems, knowledge retrieval, LLM infrastructure, and applied AI.',
        },
        {
          name: 'System Architecture',
          description:
            'Backend services, enterprise systems, integration, and platform architecture.',
        },
        {
          name: 'Cloud & Software Delivery',
          description: 'Cloud infrastructure, DevOps, CI/CD, reliability, and software quality.',
        },
        {
          name: 'Security & Application Engineering',
          description: 'Security, privacy, web and mobile applications, and production software.',
        },
      ],
    },
    research: {
      heading: 'Research',
      venue: 'Journal of Information Security and Applications · 2026',
      record: 'Volume 99 · Article 104422',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      detail:
        'Co-authored research on leakage-resilient certificate-based encryption designed to remain secure under continual key leakage.',
      areasLabel: 'Research topics',
      areas: [
        'Leakage-Resilient Cryptography',
        'Certificate-Based Encryption',
        'Side-Channel Security',
        'Equality Testing',
      ],
      cta: 'View Publication',
      href: PUBLICATION_URL,
    },
    education: {
      heading: 'Education',
      degree: 'M.S. in Computer Science and Engineering',
      institution: 'National Taiwan Ocean University',
    },
    credentials: {
      heading: 'Selected Credentials',
      items: [
        {
          name: 'AI應用規劃師（機器學習）— 中級能力鑑定',
          meta: 'Ministry of Economic Affairs, Taiwan · 2025',
        },
        {
          name: 'Microsoft AI-900',
          meta: 'Azure AI Fundamentals',
        },
      ],
    },
    principles: {
      heading: 'Engineering Principles',
      statement: 'Reliable AI systems require more than capable models.',
      items: [
        'Traceable',
        'Testable',
        'Observable',
        'Permission-aware',
        'Replaceable',
        'Recoverable',
      ],
    },
  },
  zh: {
    title: '關於 Oliver Yu — AI 系統工程師與系統架構師',
    description:
      'Oliver Yu 是 AI 系統工程師與系統架構師，具 10+ 年軟體、雲端、架構、資安與 AI 系統工程經驗。',
    eyebrow: '關於 Oliver',
    heading: 'Oliver Yu',
    role: 'AI 系統工程師 · 系統架構師',
    intro: '具 10+ 年軟體工程經驗，目前在台灣工作。',
    summary: [
      '技術背景包括企業系統、雲端平台、行動與 Web 應用、軟體安全、機器學習與 AI 系統。',
      '目前專注於 AI 基礎架構、Coding Agent、知識系統，以及 AI 應用的產品化與落地。',
    ],
    career: {
      heading: '職涯歷程',
      label: '10+ 年',
      stages: ['軟體工程', '系統架構', 'AI 系統'],
      summary: '從應用程式與企業系統開發，逐步延伸至平台架構與 AI 系統工程。',
      cta: '查看專業工程經歷',
      href: '/zh/work/professional-engineering/',
    },
    focus: {
      heading: '工程專長',
      items: [
        {
          name: 'AI 系統',
          description: 'Agent 系統、知識檢索、LLM 基礎架構與 AI 應用。',
        },
        {
          name: '系統架構',
          description: '後端服務、企業系統、系統整合與平台架構。',
        },
        {
          name: '雲端與軟體交付',
          description: '雲端基礎架構、DevOps、CI/CD、可靠性與軟體品質。',
        },
        {
          name: '資安與應用開發',
          description: '資安、隱私、Web／行動應用與正式軟體系統。',
        },
      ],
    },
    research: {
      heading: '研究',
      venue: 'Journal of Information Security and Applications · 2026',
      record: 'Volume 99 · Article 104422',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      detail: '共同研究抗洩漏憑證式加密，透過金鑰更新機制提升系統在持續金鑰洩漏情境下的安全性。',
      areasLabel: '研究主題',
      areas: ['抗洩漏密碼學', '憑證式加密', '側通道安全', '等值測試'],
      cta: '查看論文',
      href: PUBLICATION_URL,
    },
    education: {
      heading: '學歷',
      degree: '資訊工程碩士',
      institution: '國立臺灣海洋大學',
    },
    credentials: {
      heading: '專業證照',
      items: [
        {
          name: 'AI應用規劃師（機器學習）－中級能力鑑定',
          meta: '經濟部 · 2025',
        },
        {
          name: 'Microsoft AI-900',
          meta: 'Azure AI Fundamentals',
        },
      ],
    },
    principles: {
      heading: '工程原則',
      statement: '可靠的 AI 系統，靠的不只是夠強的模型。',
      items: ['可追溯', '可測試', '可觀測', '權限受控', '可替換', '可復原'],
    },
  },
} satisfies AboutDictionary;
