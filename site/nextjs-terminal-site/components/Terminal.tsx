import React, { useState, useEffect, useRef, useCallback } from 'react';
import CommandInput from './CommandInput';
import TerminalLine from './TerminalLine';
import { COMMANDS } from './commands/index';
import type { LineType } from './TerminalLine';
import type { ResumeData } from '../lib/parseResume';

interface OutputLine {
  id: string;
  type: LineType;
  content: React.ReactNode;
  prefix?: string;
}

interface TerminalProps {
  resumeData: ResumeData;
}

let lineCounter = 0;
function nextId() { return `l-${++lineCounter}`; }
function line(type: LineType, content: React.ReactNode, prefix?: string): OutputLine {
  return { id: nextId(), type, content, prefix };
}

const BOOT_LINES = [
  { type: 'info' as LineType,    text: '┌─────────────────────────────────────────────────┐' },
  { type: 'info' as LineType,    text: '│  yigang666 v1.0.0  ·  DevOps Portfolio Terminal  │' },
  { type: 'info' as LineType,    text: '└─────────────────────────────────────────────────┘' },
  { type: 'output' as LineType,  text: '' },
  { type: 'success' as LineType, text: '▶  Kernel: Linux 6.1.0-devops  ·  Arch: x86_64' },
  { type: 'success' as LineType, text: '▶  Session started: ' + new Date().toISOString().replace('T', ' ').slice(0, 19) },
  { type: 'output' as LineType,  text: '' },
  { type: 'command' as LineType, text: 'whoami',  prefix: true },
  { type: 'output' as LineType,  text: 'yigang-li' },
  { type: 'output' as LineType,  text: '' },
  { type: 'command' as LineType, text: 'cat /etc/role',  prefix: true },
  { type: 'output' as LineType,  text: 'DevOps Engineer  ·  Software Engineer' },
  { type: 'output' as LineType,  text: 'CrimsonLogic Pte Ltd  ·  Singapore' },
  { type: 'output' as LineType,  text: '' },
  { type: 'command' as LineType, text: 'echo $SKILLS',  prefix: true },
  { type: 'output' as LineType,  text: 'Dynatrace  Java  Linux  SQL  RHCSA' },
  { type: 'output' as LineType,  text: '' },
  { type: 'info' as LineType,    text: 'Type  help  to see available commands.' },
  { type: 'output' as LineType,  text: '' },
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-SG', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-green-600 font-mono text-xs">{time}</span>;
}

export default function Terminal({ resumeData }: TerminalProps) {
  const [outputLines, setOutputLines] = useState<OutputLine[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sessionCmds, setSessionCmds] = useState(0);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [outputLines, scrollToBottom]);

  // Boot sequence: reveal lines one by one
  useEffect(() => {
    let cancelled = false;
    let idx = 0;
    function addNext() {
      if (cancelled || idx >= BOOT_LINES.length) {
        if (!cancelled) setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      const b = BOOT_LINES[idx++];
      setOutputLines(prev => [
        ...prev,
        line(b.type, b.text, b.prefix ? 'yigang@devops:~$' : undefined),
      ]);
      const delay = b.text === '' ? 20 : b.type === 'command' ? 80 : 30;
      setTimeout(addNext, delay);
    }
    const t = setTimeout(addNext, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  function handleContainerClick() { inputRef.current?.focus(); }

  function dispatch(trimmed: string) {
    const [cmd, ...args] = trimmed.split(/\s+/);
    const cmdLower = cmd.toLowerCase();

    if (cmdLower === 'clear') { setOutputLines([]); return; }

    const builtins: Record<string, () => OutputLine[]> = {
      whoami: () => [line('output', 'yigang-li'), line('output', '')],
      role:   () => [
        line('output', 'DevOps Engineer  ·  Software Engineer'),
        line('output', 'CrimsonLogic Pte Ltd  ·  Singapore'),
        line('output', ''),
      ],
      skills: () => [
        line('output', 'Technical :  Dynatrace  Java  Linux  SQL'),
        line('output', 'Certs     :  RHCSA'),
        line('output', 'Languages :  English (Native)  ·  Mandarin (Native)'),
        line('output', ''),
      ],
      pwd:    () => [line('output', '/home/yigang'), line('output', '')],
      ls:     () => [line('output', 'about  blog  contact  dashboard  projects  resume'), line('output', '')],
      date:   () => [line('output', new Date().toString()), line('output', '')],
      echo:   () => [line('output', args.join(' ')), line('output', '')],
      uname:  () => [line('output', 'Linux devops 6.1.0 #1 SMP x86_64 GNU/Linux'), line('output', '')],
    };

    if (cmdLower in builtins) {
      setOutputLines(prev => [...prev, ...builtins[cmdLower]()]);
      return;
    }

    if (cmdLower in COMMANDS) {
      const Component = COMMANDS[cmdLower];
      setOutputLines(prev => [
        ...prev,
        line('output', React.createElement(Component, { resumeData })),
        line('output', ''),
      ]);
      return;
    }

    setOutputLines(prev => [
      ...prev,
      line('error', `-bash: ${cmd}: command not found`),
      line('info', 'hint: type "help" to see available commands'),
      line('output', ''),
    ]);
  }

  function handleSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setSessionCmds(n => n + 1);
    setOutputLines(prev => [...prev, line('command', trimmed, 'yigang@devops:~$')]);
    dispatch(trimmed);
    setInputValue('');
  }

  function handleArrowUp() {
    if (!commandHistory.length) return;
    const next = Math.min(historyIndex + 1, commandHistory.length - 1);
    setHistoryIndex(next);
    setInputValue(commandHistory[next] ?? '');
  }

  function handleArrowDown() {
    if (historyIndex <= 0) { setHistoryIndex(-1); setInputValue(''); return; }
    const next = historyIndex - 1;
    setHistoryIndex(next);
    setInputValue(commandHistory[next] ?? '');
  }

  return (
    <div className="crt vignette flex flex-col h-full matrix-bg" onClick={handleContainerClick}>

      {/* ── Header bar ── */}
      <div className="terminal-header flex items-center justify-between px-4 py-1.5 flex-shrink-0 select-none">
        {/* Window controls (decorative) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="win-dot" style={{ background: '#ff5f57' }} />
            <span className="win-dot" style={{ background: '#febc2e' }} />
            <span className="win-dot" style={{ background: '#28c840' }} />
          </div>
          <span className="text-xs font-mono ml-2" style={{ color: '#1a4d1a' }}>
            yigang@devops: ~/portfolio
          </span>
        </div>

        {/* Title */}
        <span className="text-xs font-mono glow" style={{ color: '#00ff41', letterSpacing: '0.1em' }}>
          YIGANG.DEV  ·  DEVOPS PORTFOLIO
        </span>

        {/* Right stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span style={{ color: '#2d7a2d' }}>ONLINE</span>
          </span>
          <LiveClock />
        </div>
      </div>

      {/* ── Output area ── */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto px-5 py-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {outputLines.map((l) => (
          <TerminalLine key={l.id} type={l.type} content={l.content} prefix={l.prefix} />
        ))}
      </div>

      {/* ── Input bar ── */}
      <CommandInput
        ref={inputRef}
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        onArrowUp={handleArrowUp}
        onArrowDown={handleArrowDown}
      />

      {/* ── Status bar ── */}
      <div className="terminal-footer flex items-center justify-between px-4 py-1 flex-shrink-0 select-none">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span style={{ color: '#1a4d1a' }}>SSH</span>
          <span style={{ color: '#1a3d1a' }}>·</span>
          <span style={{ color: '#1a4d1a' }}>bash 5.2</span>
          <span style={{ color: '#1a3d1a' }}>·</span>
          <span style={{ color: '#1a4d1a' }}>utf-8</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span style={{ color: '#1a4d1a' }}>{sessionCmds} cmds</span>
          <span style={{ color: '#1a3d1a' }}>·</span>
          <span style={{ color: '#1a4d1a' }}>↑↓ history</span>
          <span style={{ color: '#1a3d1a' }}>·</span>
          <span style={{ color: '#1a4d1a' }}>tab: complete</span>
        </div>
      </div>
    </div>
  );
}
