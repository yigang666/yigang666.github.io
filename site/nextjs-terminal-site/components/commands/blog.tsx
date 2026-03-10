import React from 'react';

interface BlogPost {
  date: string;
  title: string;
  summary: string;
  tags: string[];
}

export default function BlogCommand() {
  const posts: BlogPost[] = [
    {
      date: '2024-11-15',
      title: 'Setting Up Dynatrace APM for Java Microservices',
      summary:
        'A practical guide to instrumenting Java applications with Dynatrace OneAgent — covering auto-discovery, custom dashboards, and SLA alerting.',
      tags: ['Dynatrace', 'Java', 'Monitoring', 'APM'],
    },
    {
      date: '2024-09-02',
      title: 'RHCSA Study Notes: Key Concepts for Red Hat Certification',
      summary:
        'Notes from preparing for the RHCSA exam — systemd, SELinux, storage management, and user/group administration on RHEL.',
      tags: ['Linux', 'RHCSA', 'Red Hat', 'Certification'],
    },
    {
      date: '2024-06-20',
      title: 'Building a CI/CD Pipeline for Static Sites on GitHub Actions',
      summary:
        'Step-by-step walkthrough of creating a build, test, and deploy pipeline for a Next.js static export site using GitHub Actions and GitHub Pages.',
      tags: ['CI/CD', 'GitHub Actions', 'Next.js', 'DevOps'],
    },
  ];

  return (
    <div className="font-mono text-sm">
      <div className="text-cyan-400 mb-3">╔══════════════════════════════════════════╗</div>
      <div className="text-cyan-400 mb-1">║              DEVOPS BLOG                ║</div>
      <div className="text-cyan-400 mb-3">╚══════════════════════════════════════════╝</div>
      {posts.map((post, i) => (
        <div key={i} className="mb-5 border-l-2 border-green-900 pl-3">
          <div className="text-gray-500 text-xs">{post.date}</div>
          <div className="text-white font-bold mt-1">{post.title}</div>
          <div className="text-gray-200 mt-1 leading-relaxed">{post.summary}</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-amber-400 border border-amber-900 px-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="text-gray-500 mt-2">
        Blog posts coming soon — follow on{' '}
        <span className="text-cyan-400">GitHub</span> for updates.
      </div>
    </div>
  );
}
