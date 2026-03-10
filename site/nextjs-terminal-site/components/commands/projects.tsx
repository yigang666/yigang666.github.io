import React from 'react';

interface Project {
  name: string;
  description: string;
  tech: string;
  url: string | null;
  status: string;
}

export default function ProjectsCommand() {
  const githubOwner = (process.env.NEXT_PUBLIC_GITHUB_REPO || 'yigang666/yigang666.github.io').split('/')[0];

  const projects: Project[] = [
    {
      name: 'yigang666.github.io',
      description: 'DevOps portfolio — terminal-style static site with live CI/CD dashboard',
      tech: 'Next.js · TypeScript · TailwindCSS · GitHub Actions · Terraform',
      url: `https://github.com/${githubOwner}/yigang666.github.io`,
      status: 'LIVE',
    },
    {
      name: 'incident-management-sop',
      description: 'Automated incident response SOPs with runbooks and alerting integrations',
      tech: 'Dynatrace · PagerDuty · Bash · Python',
      url: null,
      status: 'INTERNAL',
    },
    {
      name: 'debian-package-builder',
      description: 'Automated Debian package build pipeline with CI integration',
      tech: 'Bash · Python · Jenkins · Debian packaging',
      url: null,
      status: 'INTERNAL',
    },
    {
      name: 'performance-monitoring-suite',
      description: 'Full-stack APM setup with Dynatrace dashboards and SLA alerting',
      tech: 'Dynatrace · Java · SQL · Linux',
      url: null,
      status: 'INTERNAL',
    },
  ];

  return (
    <div className="font-mono text-sm">
      <div className="text-cyan-400 mb-3">╔══════════════════════════════════════════════════════╗</div>
      <div className="text-cyan-400 mb-1">║                    PROJECTS                         ║</div>
      <div className="text-cyan-400 mb-3">╚══════════════════════════════════════════════════════╝</div>
      {projects.map((project, i) => (
        <div key={i} className="mb-4 border-l-2 border-green-900 pl-3">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-bold">{project.name}</span>
            <span
              className={`text-xs px-1 ${
                project.status === 'LIVE'
                  ? 'text-green-400 border border-green-400'
                  : 'text-gray-500 border border-gray-700'
              }`}
            >
              {project.status}
            </span>
          </div>
          <div className="text-gray-200 mt-1">{project.description}</div>
          <div className="text-amber-400 mt-1 text-xs">{project.tech}</div>
          {project.url && (
            <div className="mt-1">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline text-xs"
              >
                {project.url}
              </a>
            </div>
          )}
        </div>
      ))}
      <div className="text-gray-500 mt-2">
        Professional projects marked INTERNAL are proprietary.
      </div>
    </div>
  );
}
