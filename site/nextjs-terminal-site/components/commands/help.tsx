import React from 'react';

const G = '#00ff41';
const C = '#00e5ff';
const DIM = '#4a7c59';

const cmds = [
  { name: 'about',     desc: 'Who is Yigang Li' },
  { name: 'resume',    desc: 'Education, experience, skills' },
  { name: 'projects',  desc: 'Portfolio projects' },
  { name: 'blog',      desc: 'DevOps blog posts' },
  { name: 'dashboard', desc: 'Live CI/CD & repository status' },
  { name: 'contact',   desc: 'Get in touch' },
  { name: '──────',    desc: '' },
  { name: 'whoami',    desc: 'Current user' },
  { name: 'role',      desc: 'Current role' },
  { name: 'skills',    desc: 'Technical skills' },
  { name: 'ls',        desc: 'List sections' },
  { name: 'pwd',       desc: 'Working directory' },
  { name: 'date',      desc: 'Current date & time' },
  { name: 'uname',     desc: 'System info' },
  { name: 'echo',      desc: 'Print text' },
  { name: 'clear',     desc: 'Clear the terminal' },
];

export default function HelpCommand() {
  return (
    <div className="font-mono text-sm">
      <div style={{ color: C }} className="mb-2 glow-cyan">
        ── Available Commands ─────────────────────────
      </div>
      {cmds.map((c) =>
        c.name.startsWith('──') ? (
          <div key={c.name} style={{ color: '#1a3d1a' }} className="my-0.5">
            {c.name}
          </div>
        ) : (
          <div key={c.name} className="flex gap-2 leading-relaxed">
            <span className="w-24 flex-shrink-0 glow" style={{ color: G }}>
              {c.name}
            </span>
            <span style={{ color: '#a0d4a0' }}>{c.desc}</span>
          </div>
        )
      )}
      <div className="mt-3" style={{ color: DIM }}>
        ↑↓ history  ·  Ctrl+C clear line  ·  Tab (coming soon)
      </div>
    </div>
  );
}
