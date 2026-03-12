import Head from 'next/head';
import type { GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type ResumeSection, type ContactData } from '../lib/parseContent';
import { useLang, t } from '../lib/i18n';

interface ResumePageProps {
  resume: ResumeSection;
  contact: ContactData;
}

const ResumePage: NextPage<ResumePageProps> = ({ resume, contact }) => {
  const { lang } = useLang();
  const T = t[lang].resume;
  const { experience, education, skills } = resume;

  return (
    <>
      <Head>
        <title>{T.title} — Yigang Li</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-3xl mx-auto px-8 py-20">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">{T.title}</h1>
          <div className="flex gap-4 flex-wrap">
            <a href={`mailto:${contact.email}`} className="text-[#a0a0a0] hover:text-white text-sm transition-colors">
              {contact.email}
            </a>
            <span className="text-[#333]">·</span>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#a0a0a0] hover:text-white text-sm transition-colors">
              LinkedIn
            </a>
            <span className="text-[#333]">·</span>
            <span className="text-[#a0a0a0] text-sm">{contact.phone}</span>
          </div>
        </div>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-8">{T.experience}</h2>
          <div className="space-y-10">
            {experience.map((exp, i) => {
              const role = lang === 'zh' ? (exp.role_zh || exp.role) : exp.role;
              const bullets = lang === 'zh' && exp.bullets_zh.length ? exp.bullets_zh : exp.bullets;
              return (
                <div key={i} className="border-l border-[#222] pl-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-white font-semibold text-base">{exp.company}</h3>
                    <span className="text-[#555] text-xs font-mono ml-4 flex-shrink-0">{exp.period}</span>
                  </div>
                  <p className="text-[#19c37d] text-sm mb-3">{role}</p>
                  <ul className="space-y-1.5">
                    {bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-3 text-sm text-[#a0a0a0] leading-relaxed">
                        <span className="text-[#333] flex-shrink-0 mt-0.5">–</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-[#1a1a1a] mb-16" />

        {/* Education */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-8">{T.education}</h2>
          <div className="space-y-6">
            {education.map((edu, i) => {
              const degree = lang === 'zh' ? (edu.degree_zh || edu.degree) : edu.degree;
              return (
                <div key={i} className="border-l border-[#222] pl-6">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-white font-semibold text-base">{edu.institution}</h3>
                    <span className="text-[#555] text-xs font-mono ml-4 flex-shrink-0">{edu.period}</span>
                  </div>
                  <p className="text-[#a0a0a0] text-sm">{degree}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-[#1a1a1a] mb-16" />

        {/* Skills */}
        <section>
          <h2 className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-8">{T.skills}</h2>
          <div className="space-y-6">
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">{T.technical}</p>
              <div className="flex flex-wrap gap-2">
                {skills.technical.map(s => (
                  <span key={s} className="bg-[#111] border border-[#222] text-[#a0a0a0] text-xs px-3 py-1.5 font-mono">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">{T.certifications}</p>
              <div className="flex flex-wrap gap-2">
                {skills.certifications.map(s => (
                  <span key={s} className="bg-[#111] border border-[#19c37d]/30 text-[#19c37d] text-xs px-3 py-1.5 font-mono">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wider mb-3">{T.languages}</p>
              <div className="flex flex-wrap gap-2">
                {skills.languages.map(s => (
                  <span key={s} className="bg-[#111] border border-[#222] text-[#a0a0a0] text-xs px-3 py-1.5 font-mono">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ResumePageProps> = async () => {
  const content = parseContent(getContentPath());
  return { props: { resume: content.resume, contact: content.contact } };
};

export default ResumePage;
