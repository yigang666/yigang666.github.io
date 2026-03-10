import React from 'react';

export default function ContactCommand() {
  const githubOwner = (process.env.NEXT_PUBLIC_GITHUB_REPO || 'yigang666/yigang666.github.io').split('/')[0];

  return (
    <div className="font-mono text-sm space-y-2">
      <div className="text-cyan-400 mb-2">╔══════════════════════════════════════════╗</div>
      <div className="text-cyan-400 mb-1">║               CONTACT                   ║</div>
      <div className="text-cyan-400 mb-3">╚══════════════════════════════════════════╝</div>
      <div>
        <span className="text-green-400">email     </span>
        <a
          href="mailto:yigang.li.2016@sis.smu.edu.sg"
          className="text-cyan-400 hover:underline"
        >
          yigang.li.2016@sis.smu.edu.sg
        </a>
      </div>
      <div>
        <span className="text-green-400">phone     </span>
        <span className="text-gray-200">+65 8839 5081</span>
      </div>
      <div>
        <span className="text-green-400">linkedin  </span>
        <a
          href="https://www.linkedin.com/in/yigang-li"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          https://www.linkedin.com/in/yigang-li
        </a>
      </div>
      <div>
        <span className="text-green-400">github    </span>
        <a
          href={`https://github.com/${githubOwner}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          {`https://github.com/${githubOwner}`}
        </a>
      </div>
      <div className="mt-3 text-gray-500">
        Preferred contact: email or LinkedIn for professional inquiries.
      </div>
    </div>
  );
}
