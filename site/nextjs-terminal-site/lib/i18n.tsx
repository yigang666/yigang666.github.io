import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'en' | 'zh';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'zh') setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// ── Static UI translations ──────────────────────────────────────────────────

export const t = {
  en: {
    nav: {
      about: 'About',
      resume: 'Resume',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
    },
    about: {
      greeting: "Hi, I'm",
      cta_resume: 'View Resume',
      cta_contact: 'Contact',
      section_focus: 'Focus Areas',
      section_tech: 'Technologies',
    },
    resume: {
      title: 'Resume',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      technical: 'Technical',
      certifications: 'Certifications',
      languages: 'Languages',
    },
    projects: {
      title: 'Projects',
      subtitle: 'A selection of professional and personal work. Internal projects are proprietary.',
      github: 'View on GitHub',
      proprietary: 'Proprietary · Not public',
    },
    blog: {
      title: 'Blog',
      subtitle: 'Writing on DevOps, Linux, and infrastructure engineering.',
    },
    contact: {
      title: 'Contact',
      subtitle:
        'Open to opportunities and conversations about DevOps, infrastructure, and engineering. Best reached via email or LinkedIn.',
      cta: 'Send an Email',
      email: 'Email',
      phone: 'Phone',
    },
  },
  zh: {
    nav: {
      about: '关于我',
      resume: '简历',
      projects: '项目',
      blog: '博客',
      contact: '联系',
    },
    about: {
      greeting: '嗨，我是',
      cta_resume: '查看简历',
      cta_contact: '联系我',
      section_focus: '专注领域',
      section_tech: '技术栈',
    },
    resume: {
      title: '简历',
      experience: '工作经历',
      education: '教育背景',
      skills: '技能',
      technical: '技术技能',
      certifications: '认证',
      languages: '语言能力',
    },
    projects: {
      title: '项目',
      subtitle: '部分专业和个人项目展示，内部项目属保密项目。',
      github: '在 GitHub 查看',
      proprietary: '保密项目 · 不公开',
    },
    blog: {
      title: '博客',
      subtitle: '关于 DevOps、Linux 和基础设施工程的技术文章。',
    },
    contact: {
      title: '联系我',
      subtitle:
        '欢迎就 DevOps、基础设施和工程话题交流探讨，邮件或 LinkedIn 优先。',
      cta: '发送邮件',
      email: '邮箱',
      phone: '电话',
    },
  },
} as const;
