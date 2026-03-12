export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] mt-24">
      <div className="max-w-5xl mx-auto px-8 py-8 flex items-center justify-between">
        <p className="text-[#555] text-sm">© 2025 Yigang Li</p>
        <div className="flex gap-6">
          <a
            href="https://github.com/yigang666"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:text-[#a0a0a0] text-sm transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/yigang-li"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555] hover:text-[#a0a0a0] text-sm transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
