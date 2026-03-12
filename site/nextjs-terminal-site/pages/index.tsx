import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type AboutData, type ContactData } from '../lib/parseContent';
import { useLang, t } from '../lib/i18n';

interface AboutPageProps {
  about: AboutData;
  contact: ContactData;
}

const About: NextPage<AboutPageProps> = ({ about }) => {
  const { lang } = useLang();
  const T = t[lang].about;

  const role = lang === 'zh' ? (about.role_zh || about.role) : about.role;
  const location = lang === 'zh' ? (about.location_zh || about.location) : about.location;
  const bio = lang === 'zh' ? (about.bio_zh || about.bio) : about.bio;
  const focus = lang === 'zh' && about.focus_zh.length ? about.focus_zh : about.focus;
  const firstName = about.name.split(' ').slice(-1)[0];

  return (
    <>
      <Head>
        <title>Yigang Li — {role}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={`Yigang Li — ${role} based in ${location}.`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-20 pb-16">
        <div className="flex flex-col md:flex-row md:items-start md:gap-14">

          {/* Text */}
          <div className="flex-1 md:pt-2">
            <p className="text-[#19c37d] text-sm font-medium mb-4 tracking-wide">
              {role} · {location}
            </p>
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              {T.greeting} {firstName}
            </h1>
            <p className="text-lg text-[#a0a0a0] leading-relaxed mb-10">
              {bio}
            </p>
            <div className="flex gap-4">
              <Link
                href="/resume"
                className="px-5 py-2.5 bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                {T.cta_resume}
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 border border-[#2a2a2a] text-[#f5f5f5] text-sm font-medium hover:border-[#3a3a3a] hover:bg-[#111] transition-colors"
              >
                {T.cta_contact}
              </Link>
            </div>
          </div>

          {/* Photo */}
          <div className="flex-shrink-0 w-56 mt-10 md:mt-14">
            <div className="overflow-hidden rounded-3xl" style={{ aspectRatio: '3 / 4' }}>
              <img
                src="/selfie.jpg"
                alt={about.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: '42% 38%', filter: 'brightness(0.9) contrast(1.02)' }}
              />
            </div>
          </div>

        </div>
      </section>

      <div className="max-w-3xl mx-auto px-8"><div className="border-t border-[#1a1a1a]" /></div>

      {/* Focus areas */}
      <section className="max-w-3xl mx-auto px-8 py-16">
        <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-8">
          {T.section_focus}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {focus.map((area) => (
            <div key={area} className="flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-[#19c37d] flex-shrink-0" />
              <span className="text-[#f5f5f5] text-sm">{area}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-8"><div className="border-t border-[#1a1a1a]" /></div>

      {/* Technologies */}
      <section className="max-w-3xl mx-auto px-8 py-16">
        <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-8">
          {T.section_tech}
        </h2>
        <div className="flex flex-wrap gap-2">
          {about.technologies.map((skill) => (
            <span key={skill} className="bg-[#111] border border-[#222] text-[#a0a0a0] text-xs px-3 py-1.5 font-mono">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </>
  );
};

export const getStaticProps: GetStaticProps<AboutPageProps> = async () => {
  const content = parseContent(getContentPath());
  return { props: { about: content.about, contact: content.contact } };
};

export default About;
