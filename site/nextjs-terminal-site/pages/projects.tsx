import Head from 'next/head';
import type { GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type ProjectData } from '../lib/parseContent';
import { useLang, t } from '../lib/i18n';

interface ProjectsPageProps {
  projects: ProjectData[];
}

const Projects: NextPage<ProjectsPageProps> = ({ projects }) => {
  const { lang } = useLang();
  const T = t[lang].projects;

  return (
    <>
      <Head>
        <title>{T.title} — Yigang Li</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">{T.title}</h1>
        <p className="text-[#a0a0a0] text-sm mb-16">{T.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const description = lang === 'zh' ? (project.description_zh || project.description) : project.description;
            return (
              <div
                key={project.name}
                className="bg-[#111] border border-[#1e1e1e] p-6 flex flex-col hover:border-[#2a2a2a] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm leading-snug font-mono">{project.name}</h3>
                  <span className={`text-xs px-2 py-0.5 font-mono ml-3 flex-shrink-0 ${
                    project.status === 'LIVE'
                      ? 'text-[#19c37d] border border-[#19c37d]/30 bg-[#19c37d]/5'
                      : 'text-[#555] border border-[#222]'
                  }`}>
                    {project.status === 'LIVE' ? 'LIVE' : (lang === 'zh' ? '内部' : 'INTERNAL')}
                  </span>
                </div>

                <p className="text-[#a0a0a0] text-sm leading-relaxed flex-1 mb-4">{description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map(tech => (
                    <span key={tech} className="text-[#555] text-xs px-2 py-0.5 bg-[#0a0a0a] border border-[#1a1a1a] font-mono">{tech}</span>
                  ))}
                </div>

                {project.url ? (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[#a0a0a0] hover:text-white text-xs transition-colors flex items-center gap-1">
                    {T.github} <span className="text-[#333]">↗</span>
                  </a>
                ) : (
                  <span className="text-[#333] text-xs">{T.proprietary}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const content = parseContent(getContentPath());
  return { props: { projects: content.projects } };
};

export default Projects;
