import React from 'react';

export type LineType = 'command' | 'output' | 'error' | 'info' | 'success';

interface TerminalLineProps {
  type: LineType;
  content: React.ReactNode;
  prefix?: string;
}

// Prompt rendered as colored segments (yigang @ devops : ~ $)
function Prompt() {
  return (
    <span className="select-none whitespace-nowrap mr-2 flex-shrink-0">
      <span className="prompt-user">yigang</span>
      <span className="prompt-at">@</span>
      <span className="prompt-host">devops</span>
      <span className="prompt-sep">:</span>
      <span className="prompt-path">~</span>
      <span className="prompt-dollar">$</span>
    </span>
  );
}

export default function TerminalLine({ type, content, prefix }: TerminalLineProps) {
  if (type === 'output' && content === '') {
    return <div className="h-1.5" />;
  }

  if (type === 'command') {
    return (
      <div className="term-line flex items-baseline">
        {prefix ? <Prompt /> : null}
        <span className="glow" style={{ color: '#00ff41' }}>{content}</span>
      </div>
    );
  }

  const styles: Record<LineType, { color: string; className: string }> = {
    command: { color: '#00ff41', className: 'glow' },
    output:  { color: '#c8ffc8', className: '' },
    error:   { color: '#ff3b3b', className: 'glow-red' },
    info:    { color: '#00e5ff', className: 'glow-cyan' },
    success: { color: '#00ff41', className: 'glow' },
  };

  const s = styles[type];

  return (
    <div className={`term-line ${s.className}`} style={{ color: s.color }}>
      {content}
    </div>
  );
}
