import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const isBook = location.pathname === "/book";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-[clamp(20px,4vw,48px)] py-4",
          "bg-navy/70 backdrop-blur-xl saturate-150",
          "border-b transition-all duration-300",
          scrolled ? "border-white/[0.06] bg-navy/90" : "border-transparent"
        )}
      >
        <div className="max-w-[1180px] mx-auto flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3.5 group" aria-label="Ahmad Shayan home">
            <span
              className={cn(
                "w-[42px] h-[42px] rounded-[11px] grid place-items:center overflow-hidden",
                "bg-gradient-to-br from-white/[0.08] to-transparent",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.10)_inset,0_0_18px_-2px_rgba(37,99,235,0.45)]",
                "transition-all duration-300",
                "group-hover:rotate-[-3deg] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset,0_0_32px_-2px_rgba(37,99,235,0.8)]"
              )}
              style={{ display: "grid", placeItems: "center" }}
            >
              <img
                src="/assets/ahmasoft-icon.png"
                alt="Ahmasoft"
                className="w-[30px] h-[30px] object-contain drop-shadow-[0_1px_4px_rgba(37,99,235,0.45)] transition-transform duration-300 group-hover:scale-[1.08]"
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-[18px] tracking-[-0.01em] text-white font-medium">Ahmad Shayan</span>
              <span className="text-[11.5px] text-white/55 tracking-[0.04em]">Claude Code Coaching</span>
            </span>
          </Link>

          {isBook ? (
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/[0.14] text-white/70 text-sm font-medium hover:border-white/30 hover:text-white transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 5 5 12 12 19"/></svg>
              Back to home
            </Link>
          ) : (
            <Link
              to="/book"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-blue text-white text-sm font-semibold shadow-[0_6px_18px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-14px_rgba(37,99,235,0.8)] hover:bg-[#1d57db] transition-all duration-200"
            >
              Book a call
            </Link>
          )}

          <button
            className="sm:hidden w-[42px] h-[42px] grid place-items-center rounded-[10px] bg-transparent border border-white/[0.12] text-white"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-navy flex flex-col items-center justify-center gap-7">
          <button
            className="absolute top-[18px] right-[clamp(20px,4vw,48px)] w-[42px] h-[42px] grid place-items-center rounded-[10px] border border-white/[0.14] text-white"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {[
            { to: "/#who",   label: "Who it's for" },
            { to: "/#sprint", label: "The Sprint" },
            { to: "/#how",    label: "How it works" },
            { to: "/#faq",    label: "FAQ" },
          ].map(({ to, label }) => (
            <a
              key={to}
              href={to}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-white/70 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            to="/book"
            className="px-7 py-4 rounded-full bg-blue text-white text-lg font-semibold shadow-[0_6px_18px_-8px_rgba(37,99,235,0.6)]"
            onClick={() => setOpen(false)}
          >
            Book a call
          </Link>
        </div>
      )}
    </>
  );
}
