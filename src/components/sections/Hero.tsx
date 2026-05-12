import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const dur = 1600;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}</span>;
}

const reveal = {
  hidden: { opacity: 0, y: 22 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.2, 0.6, 0.2, 1], delay: d } }),
};

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const move = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      [[orb1, 1], [orb2, 2], [orb3, 3]].forEach(([ref, k]) => {
        const el = (ref as React.RefObject<HTMLDivElement>).current;
        if (el) el.style.transform = `translate3d(${x * (k as number) * 18}px,${y * (k as number) * 18}px,0)`;
      });
    };
    const leave = () => {
      [orb1, orb2, orb3].forEach(r => { if (r.current) r.current.style.transform = ""; });
    };
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => { hero.removeEventListener("mousemove", move); hero.removeEventListener("mouseleave", leave); };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-navy px-[clamp(20px,4vw,48px)] pt-[clamp(120px,16vh,180px)] pb-[clamp(72px,9vw,120px)]"
    >
      {/* Animated grid */}
      <div className="absolute inset-0 hero-grid opacity-70 z-0" aria-hidden />

      {/* Orbs */}
      <div ref={orb1} className="orb w-[520px] h-[520px] -left-[8%] top-[8%] animate-floatA z-0"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.85), transparent 65%)" }} aria-hidden />
      <div ref={orb2} className="orb w-[460px] h-[460px] -right-[6%] bottom-[6%] animate-floatB z-0"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.75), transparent 65%)" }} aria-hidden />
      <div ref={orb3} className="orb w-[300px] h-[300px] left-[42%] -top-[5%] animate-floatC z-0"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.65), transparent 65%)" }} aria-hidden />

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/85 pointer-events-none z-[1]" aria-hidden />

      <div className="relative z-[2] max-w-[1180px] mx-auto w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
        {/* Copy */}
        <div>
          <motion.span
            variants={reveal} initial="hidden" animate="show"
            className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08]"
          >
            Claude Code Coaching
          </motion.span>

          <motion.h1
            variants={reveal} initial="hidden" animate="show" custom={0.06}
            className="text-[clamp(44px,6.8vw,88px)] font-medium mt-[22px] mb-[22px] leading-[1.05] tracking-[-0.025em]"
          >
            From Zero to{" "}
            <span className="grad-text">Shipped.</span>
          </motion.h1>

          <motion.p
            variants={reveal} initial="hidden" animate="show" custom={0.12}
            className="text-[clamp(17px,1.5vw,20px)] text-white/70 max-w-[640px] mb-9 leading-[1.55]"
          >
            I coach non-technical operators to build AI tools with Claude Code. One or two live sessions. Your first AI tool, live on the internet.
          </motion.p>

          <motion.div
            variants={reveal} initial="hidden" animate="show" custom={0.18}
            className="price-badge inline-flex items-baseline gap-2.5 py-[18px] px-[26px] rounded-[18px] mb-9"
          >
            <span className="font-serif text-[clamp(44px,5.5vw,64px)] font-medium text-blue-400 text-shadow-[0_0_32px_rgba(37,99,235,0.55)] leading-none tracking-[-0.02em] [animation:priceGlow_3s_ease-in-out_infinite]">
              $250
            </span>
            <span className="text-white/60 text-sm tracking-[0.06em] uppercase font-medium">flat fee</span>
          </motion.div>

          <motion.div
            variants={reveal} initial="hidden" animate="show" custom={0.24}
            className="flex gap-3.5 flex-wrap mb-9"
          >
            <Link
              to="/book"
              className="magnetic inline-flex items-center gap-2 px-7 py-[18px] rounded-full bg-blue text-white text-base font-semibold shadow-[0_6px_18px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-14px_rgba(37,99,235,0.8)] hover:bg-[#1d57db] transition-all duration-200"
            >
              Book a 15-min fit call
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#sprint"
              className="inline-flex items-center px-7 py-[18px] rounded-full border border-white/[0.18] text-white/90 text-base font-semibold hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-200"
            >
              See what is included
            </a>
          </motion.div>

          <motion.div
            variants={reveal} initial="hidden" animate="show" custom={0.30}
            className="flex items-center gap-3.5 text-white/55 text-sm flex-wrap"
          >
            <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_12px_rgba(22,163,74,0.6)] flex-shrink-0 animate-trustPulse" />
            <span>
              <strong className="text-white/85 font-semibold">
                <AnimatedCounter target={13} /> operators
              </strong>{" "}
              building. Leaders from <strong className="text-white/85">NVIDIA</strong>,{" "}
              <strong className="text-white/85">Salesforce</strong>,{" "}
              <strong className="text-white/85">Adobe</strong>, and more.
            </span>
          </motion.div>
        </div>

        {/* Mock browser card */}
        <motion.div
          variants={reveal} initial="hidden" animate="show" custom={0.30}
          className="hidden lg:block"
          aria-hidden
        >
          <div className="relative rounded-[18px] bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] p-[18px] backdrop-blur-md animate-cardFloat">
            <div className="flex items-center gap-1.5 pb-3 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2.5 text-[11.5px] text-white/55 font-mono tracking-[0.02em]">your-tool.vercel.app</span>
            </div>
            <div className="pt-[18px] px-1.5 pb-1.5">
              <div className="font-mono text-[12.5px] text-white/55 mb-3.5">
                $ <span className="text-blue-400 font-medium">claude</span> build my churn-risk dashboard
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="self-end max-w-[90%] px-3.5 py-2.5 rounded-[12px] text-[13.5px] leading-snug text-white bg-gradient-to-br from-blue/85 to-blue/65 border border-white/[0.06]">
                  Pull last 90 days of accounts and flag the ones with declining usage.
                </div>
                <div className="self-start max-w-[90%] px-3.5 py-2.5 rounded-[12px] text-[13.5px] leading-snug text-white/88 bg-white/[0.04] border border-white/[0.07]">
                  On it. Spinning up a Next.js app, wiring your API, deploying to Vercel
                  <span className="inline-block w-1.5 h-3.5 align-[-2px] bg-blue-400 ml-0.5 animate-[caret_1s_steps(2)_infinite]" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-[11.5px] text-green-400 font-mono tracking-[0.04em] uppercase before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-400 before:shadow-[0_0_10px_#22c55e] before:animate-pulse">
                Live · deployed in 4m 12s
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
