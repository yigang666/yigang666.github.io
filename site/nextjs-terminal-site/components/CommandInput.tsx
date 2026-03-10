import React, { forwardRef } from 'react';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ value, onChange, onSubmit, onArrowUp, onArrowDown }, ref) => {
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') { e.preventDefault(); onSubmit(value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); onArrowUp(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); onArrowDown(); }
    }

    return (
      <div className="input-bar flex items-center px-5 py-2.5 flex-shrink-0">
        {/* Prompt */}
        <span className="select-none whitespace-nowrap mr-2 font-mono text-sm">
          <span className="prompt-user">yigang</span>
          <span className="prompt-at">@</span>
          <span className="prompt-host">devops</span>
          <span className="prompt-sep">:</span>
          <span className="prompt-path">~</span>
          <span className="prompt-dollar">$&nbsp;</span>
        </span>

        {/* Input + cursor */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent font-mono text-sm outline-none border-none caret-transparent"
            style={{ color: '#e0ffe0' }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="terminal input"
          />
          <span className="cursor-block" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

CommandInput.displayName = 'CommandInput';
export default CommandInput;
