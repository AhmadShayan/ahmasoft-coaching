import { Globe, Monitor, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-10 px-[clamp(20px,4vw,48px)] bg-navy border-t border-white/[0.06] text-center text-[13.5px] text-white/55 leading-relaxed">
      <div className="flex items-center justify-center gap-6 mb-5 flex-wrap">
        <a href="https://ahmadshayan.com" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-white/50 font-medium hover:text-white transition-colors hover:-translate-y-px duration-200">
          <Globe className="w-[15px] h-[15px]" />
          ahmadshayan.com
        </a>
        <a href="https://ahmasoft.com" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-white/50 font-medium hover:text-white transition-colors hover:-translate-y-px duration-200">
          <Monitor className="w-[15px] h-[15px]" />
          ahmasoft.com
        </a>
        <a href="https://www.linkedin.com/in/ehmadshayan" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-white/50 font-medium hover:text-white transition-colors hover:-translate-y-px duration-200">
          <Linkedin className="w-[15px] h-[15px]" />
          LinkedIn
        </a>
      </div>
      <div>Ahmad Shayan &nbsp;·&nbsp; Ahmasoft &nbsp;·&nbsp; Claude Code Coaching</div>
      <div className="text-white/30 mt-1">&copy; 2026 Ahmasoft</div>
    </footer>
  );
}
