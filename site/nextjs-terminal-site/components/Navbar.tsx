import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLang, t } from '../lib/i18n';

const NAV_HREFS = [
  { href: '/', key: 'about' },
  { href: '/resume', key: 'resume' },
  { href: '/projects', key: 'projects' },
  { href: '/blog', key: 'blog' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Navbar() {
  const { pathname } = useRouter();
  const { lang, setLang } = useLang();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#1a1a1a]"
      style={{ background: '#0a0a0a' }}
    >
      <div className="max-w-5xl mx-auto px-8 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-white font-bold text-base tracking-tight hover:text-white transition-colors"
        >
          Yigang Li
        </Link>

        <div className="flex items-center gap-8">
          {NAV_HREFS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={`text-[15px] transition-colors duration-150 no-underline ${
                pathname === href ? 'text-[#19c37d]' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              {t[lang].nav[key]}
            </Link>
          ))}

          {/* Language toggle */}
          <div className="flex items-center gap-2 pl-4 border-l border-[#2a2a2a]">
            <button
              onClick={() => setLang('en')}
              className={`text-[13px] font-medium transition-colors ${
                lang === 'en' ? 'text-[#19c37d]' : 'text-[#555] hover:text-[#a0a0a0]'
              }`}
            >
              EN
            </button>
            <span className="text-[#333] text-xs">·</span>
            <button
              onClick={() => setLang('zh')}
              className={`text-[13px] font-medium transition-colors ${
                lang === 'zh' ? 'text-[#19c37d]' : 'text-[#555] hover:text-[#a0a0a0]'
              }`}
            >
              中
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
