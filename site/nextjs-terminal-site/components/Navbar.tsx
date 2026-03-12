import { useState, useEffect } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const LangToggle = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLang('en')}
        className={`text-[13px] font-medium transition-colors px-1 ${
          lang === 'en' ? 'text-[#19c37d]' : 'text-[#555] hover:text-[#a0a0a0]'
        }`}
      >
        EN
      </button>
      <span className="text-[#333] text-xs">·</span>
      <button
        onClick={() => setLang('zh')}
        className={`text-[13px] font-medium transition-colors px-1 ${
          lang === 'zh' ? 'text-[#19c37d]' : 'text-[#555] hover:text-[#a0a0a0]'
        }`}
      >
        中
      </button>
    </div>
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#1a1a1a]"
        style={{ background: '#0a0a0a' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <Link
            href="/"
            className="text-white font-bold text-base tracking-tight hover:text-white transition-colors flex-shrink-0"
          >
            Yigang Li
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_HREFS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={`text-[15px] transition-colors duration-150 no-underline text-center min-w-[56px] ${
                  pathname === href ? 'text-[#19c37d]' : 'text-[#a0a0a0] hover:text-white'
                }`}
              >
                {t[lang].nav[key]}
              </Link>
            ))}
            <div className="pl-4 border-l border-[#2a2a2a]">
              <LangToggle />
            </div>
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="flex md:hidden items-center gap-4">
            <LangToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#a0a0a0] hover:text-white transition-colors p-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 border-b border-[#1a1a1a] md:hidden"
          style={{ background: '#0a0a0a' }}
        >
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_HREFS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={`text-[15px] py-3 border-b border-[#111] transition-colors no-underline ${
                  pathname === href ? 'text-[#19c37d]' : 'text-[#a0a0a0]'
                }`}
              >
                {t[lang].nav[key]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
