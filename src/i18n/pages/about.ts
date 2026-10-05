import type { Locale } from '../locales';
import { GITHUB_URL } from '../../lib/external';
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
    stages: readonly {
      period: string;
      name: string;
      description: string;
    }[];
    summary: string;
    cta: string;
    href: string;
  };
  currentFocus: {
    heading: string;
    description: string;
    alt: string;
    caption: string;
  };
  focus: {
    heading: string;
    items: readonly {
      name: string;
      description: string;
    }[];
  };
  systemsResearch: {
    heading: string;
    description: string;
    cta: string;
    href: string;
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
      'I started with iOS and web apps, picked up applied AI in 2017, and moved through backend and cloud work into system architecture.',
      'These days I build enterprise AI systems at work and do independent research on LLM inference.',
    ],
    career: {
      heading: 'Career',
      label: '10+ Years',
      stages: [
        {
          period: '2014–2017',
          name: 'Application Engineering',
          description:
            'Built and shipped iOS, mobile, and web applications. Started applied AI work in 2017.',
        },
        {
          period: '2018–2020',
          name: 'Software Engineering & Applied AI',
          description:
            'Continued applied AI work while taking on backend services, cloud integration, enterprise workflows, and end-to-end software delivery.',
        },
        {
          period: '2020–2025',
          name: 'System Architecture & Technical Leadership',
          description:
            'Owned system architecture, AI integration, engineering practices, project delivery, and cross-system integration, and mentored other engineers.',
        },
        {
          period: '2025–Present',
          name: 'Enterprise AI Systems',
          description:
            'Work on enterprise AI systems: coding agents, knowledge systems, model infrastructure, security validation, and continuous evaluation.',
        },
      ],
      summary: 'Representative systems from each stage are on a separate page.',
      cta: 'More on my engineering work',
      href: '/work/professional-engineering/',
    },
    currentFocus: {
      heading: 'Current Focus — Enterprise AI Systems',
      description:
        'I currently work on enterprise AI systems that connect engineering knowledge, coding agents, model infrastructure, security validation, and continuous evaluation.',
      alt: 'Conceptual architecture of an AI-driven R&D platform connecting enterprise context, agentic development, engineering knowledge, model gateway, and evaluation.',
      caption: 'A conceptual architecture for an AI-driven R&D platform.',
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
          description: 'Security and privacy, plus web and mobile apps.',
        },
      ],
    },
    systemsResearch: {
      heading: 'Systems Research',
      description:
        'I run independent systems research on LLM inference, on Apple silicon and on AMD GPUs. laya-apple serves requests on the MLX GPU and the Apple Neural Engine at the same time. Its research traced a GPU latency regression to Python’s GIL and sent the fix to Apple coremltools; the result shipped as laya-apple 1.5. A second program, on the oMLX server, studies how an optimization that speeds up one request changes the cost of the requests that follow it. It produced eleven upstream pull requests: five merged, and six open at the time of writing. On AMD, I took DeepSeek V4 Flash from one MI300X to two with kernel-level fixes and AITER GEMM tuning. Each is published with its data.',
      cta: 'View the research on GitHub',
      href: GITHUB_URL,
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
      '我從 iOS 和 Web 應用做起，2017 年開始投入 AI 應用，之後負責後端和雲端，再轉到系統架構。',
      '現在工作上做企業 AI 系統，另外獨立做 LLM 推論的研究。',
    ],
    career: {
      heading: '職涯歷程',
      label: '10+ 年',
      stages: [
        {
          period: '2014–2017',
          name: '應用程式工程',
          description: '開發並交付 iOS 與 Web 應用，2017 年開始投入 AI 應用開發。',
        },
        {
          period: '2018–2020',
          name: '軟體工程與 AI 應用',
          description: '持續做 AI 應用，同時負責後端服務、雲端整合、企業流程與端到端的軟體交付。',
        },
        {
          period: '2020–2025',
          name: '系統架構與技術領導',
          description: '負責系統架構、AI 整合、工程實務、專案交付與跨系統整合，並指導其他工程師。',
        },
        {
          period: '2025–至今',
          name: '企業 AI 系統',
          description:
            '投入企業 AI 系統：coding agent、知識系統、模型基礎架構、安全驗證與持續評估。',
        },
      ],
      summary: '各階段做過的代表性系統，整理在另一頁。',
      cta: '看更多工程經歷',
      href: '/zh/work/professional-engineering/',
    },
    currentFocus: {
      heading: '目前方向 — 企業 AI 系統',
      description:
        '目前專注於企業 AI 系統，將工程知識、coding agent、模型基礎架構、安全驗證與持續評估整合在同一套系統中。',
      alt: 'AI 驅動研發平台的概念架構，串接企業情境、agentic 開發、工程知識、模型閘道與評估機制。',
      caption: 'AI 驅動研發平台的概念架構圖。',
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
          description: '資安、隱私，以及 Web／行動應用。',
        },
      ],
    },
    systemsResearch: {
      heading: '系統研究',
      description:
        '我獨立做 LLM 推論的系統研究，平台涵蓋 Apple silicon 與 AMD GPU。laya-apple 同時用 MLX GPU 和 Apple Neural Engine 處理請求；研究查出一個 GPU 延遲退化的原因是 Python 的 GIL，修正已送交 Apple coremltools，成果隨 laya-apple 1.5 發布。另一條研究線以 oMLX 推論伺服器為對象，研究單一請求的最佳化會如何影響後續請求成本，過程中提交了十一個上游 PR：五個已合併，撰寫本文時另外六個仍開放審查中。在 AMD 上，我透過 kernel 層級的修正與 AITER GEMM 調校，讓 DeepSeek V4 Flash 從單張 MI300X 擴展到兩張。每項研究都連同資料公開。',
      cta: '在 GitHub 查看研究',
      href: GITHUB_URL,
    },
    research: {
      heading: '研究',
      venue: 'Journal of Information Security and Applications · 2026',
      record: 'Volume 99 · Article 104422',
      paper:
        'On the construction of a leakage-resilient certificate-based encryption with equality test scheme',
      detail:
        '共同發表的研究，探討抗洩漏憑證式加密：透過金鑰更新機制，讓系統在金鑰持續洩漏的情況下仍能維持安全性。',
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
