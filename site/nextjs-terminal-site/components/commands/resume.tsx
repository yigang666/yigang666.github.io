import React from 'react';
import type { ResumeData } from '../../lib/parseResume';

interface ResumeCommandProps {
  resumeData: ResumeData;
}

const G = '#00ff41';
const C = '#00e5ff';
const A = '#ffb300';
const W = '#c8ffc8';
const DIM = '#4a7c59';

function Section({ title }: { title: string }) {
  return (
    <div className="mt-3 mb-1.5 glow-cyan" style={{ color: C }}>
      ── {title} {'─'.repeat(Math.max(0, 36 - title.length))}
    </div>
  );
}

export default function ResumeCommand({ resumeData }: ResumeCommandProps) {
  return (
    <div className="font-mono text-sm">
      {/* Header */}
      <div style={{ color: C }} className="glow-cyan">╔══════════════════════════════════════════╗</div>
      <div style={{ color: C }} className="glow-cyan">
        ║&nbsp;&nbsp;{resumeData.name.padEnd(40)}║
      </div>
      <div style={{ color: C }} className="glow-cyan">╚══════════════════════════════════════════╝</div>

      {/* Contact */}
      <Section title="CONTACT" />
      <div className="space-y-0.5">
        <Row label="email"    value={resumeData.contact.email} />
        <Row label="phone"    value={resumeData.contact.phone} />
        <div className="flex gap-2">
          <span style={{ color: G }} className="w-20 flex-shrink-0 glow">linkedin</span>
          <a href={resumeData.contact.linkedin} target="_blank" rel="noopener noreferrer"
            className="glow-cyan hover:underline" style={{ color: C }}>
            {resumeData.contact.linkedin}
          </a>
        </div>
      </div>

      {/* Education */}
      <Section title="EDUCATION" />
      {resumeData.education.map((edu, i) => (
        <div key={i} className="mb-2">
          <div style={{ color: A }} className="glow-amber font-bold">{edu.institution}</div>
          <div style={{ color: W }}>{edu.degree}</div>
          <div style={{ color: DIM }}>{edu.period}</div>
        </div>
      ))}

      {/* Experience */}
      <Section title="EXPERIENCE" />
      {resumeData.experience.map((exp, i) => (
        <div key={i} className="mb-3">
          <div style={{ color: A }} className="glow-amber font-bold">{exp.company}</div>
          <div style={{ color: G }} className="glow">{exp.role}</div>
          <div style={{ color: DIM }} className="mb-1">{exp.period}</div>
          {exp.bullets.map((b, j) => (
            <div key={j} className="flex gap-1" style={{ color: W }}>
              <span style={{ color: G }} className="flex-shrink-0">▸</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Skills */}
      <Section title="SKILLS" />
      <div className="space-y-0.5">
        {resumeData.skills.technical.length > 0 && (
          <Row label="technical" value={resumeData.skills.technical.join('  ·  ')} />
        )}
        {resumeData.skills.certifications.length > 0 && (
          <Row label="certs" value={resumeData.skills.certifications.join('  ·  ')} />
        )}
        {resumeData.skills.linguistic.length > 0 && (
          <Row label="languages" value={resumeData.skills.linguistic.join('  ·  ')} />
        )}
        {resumeData.skills.hobbies.length > 0 && (
          <Row label="hobbies" value={resumeData.skills.hobbies.join('  ·  ')} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 flex-shrink-0 glow" style={{ color: '#00ff41' }}>{label}</span>
      <span style={{ color: '#c8ffc8' }}>{value}</span>
    </div>
  );
}
