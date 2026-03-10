import React from 'react';

const G = '#00ff41';
const C = '#00e5ff';
const A = '#ffb300';
const W = '#c8ffc8';
const DIM = '#4a7c59';

export default function AboutCommand() {
  return (
    <div className="font-mono text-sm space-y-1">
      <div style={{ color: C }} className="glow-cyan">
        ╔══════════════════════════════════════╗
      </div>
      <div style={{ color: C }} className="glow-cyan">
        ║&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ABOUT YIGANG LI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║
      </div>
      <div style={{ color: C }} className="glow-cyan">
        ╚══════════════════════════════════════╝
      </div>

      <div className="mt-2 space-y-1">
        <Row label="Name"     value="Li Yigang" />
        <Row label="Role"     value="DevOps Engineer  ·  Software Engineer" />
        <Row label="Location" value="Singapore" />
        <Row label="Company"  value="CrimsonLogic Pte Ltd" />
        <Row label="Cert"     value="RHCSA" />
      </div>

      <div className="mt-3" style={{ color: W, maxWidth: '56ch', lineHeight: 1.7 }}>
        Experienced engineer based in Singapore with a focus on infrastructure
        reliability, CI/CD automation, and application performance monitoring.
        Passionate about Linux, observability, and systems that stay up.
      </div>

      <div className="mt-3">
        <span style={{ color: G }} className="glow">Focus&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span style={{ color: A }} className="glow-amber">
          DevOps  ·  Linux  ·  Infrastructure  ·  Monitoring
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <LinkRow label="GitHub"   href="https://github.com/yigang666" />
        <LinkRow label="LinkedIn" href="https://www.linkedin.com/in/yigang-li" />
      </div>

      <div className="mt-3" style={{ color: DIM }}>
        try:{' '}
        <Cmd>resume</Cmd>  ·  <Cmd>projects</Cmd>  ·  <Cmd>contact</Cmd>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 flex-shrink-0 glow" style={{ color: '#00ff41' }}>
        {label}
      </span>
      <span style={{ color: '#c8ffc8' }}>{value}</span>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 flex-shrink-0 glow" style={{ color: '#00ff41' }}>
        {label}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="glow-cyan hover:underline"
        style={{ color: '#00e5ff' }}
      >
        {href}
      </a>
    </div>
  );
}

function Cmd({ children }: { children: React.ReactNode }) {
  return <span className="glow" style={{ color: '#00ff41' }}>{children}</span>;
}
