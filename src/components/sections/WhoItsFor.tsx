import { useRef } from "react";
import { motion } from "framer-motion";

const cards = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: "SaaS Operators",
    body: "VP or Head of CS, RevOps, or Operations at a SaaS company (200 to 5,000 employees). You want AI tools your team actually uses, not a slide deck about AI.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2l3 6 6.5 1-4.5 5 1 7-6-3.5L6 21l1-7-4.5-5L9 8z"/>
      </svg>
    ),
    title: "Owner-Operators",
    body: "Founder, CEO, or Owner at a small business under 50 people. You want to ship something real without hiring a developer.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/>
        <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/>
      </svg>
    ),
    title: "Enterprise CS Execs",
    body: "Director or Head of CS at a large company (5,000 or more employees). You want to ship AI tools without waiting on IT.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="who" className="section relative section-glow-light bg-white text-[#0b1220] py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65 }}
          className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.22] bg-blue/[0.07]"
        >
          Audience
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="text-[clamp(34px,4.4vw,56px)] font-serif font-medium mt-[18px] mb-[18px] leading-[1.06]"
        >
          Who this is <span className="grad-text-light">for</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-[#475569] text-lg max-w-[680px] mb-14"
        >
          Built for operators who want to ship, not study. If one of these sounds like you, we will get along.
        </motion.p>
        <div className="grid lg:grid-cols-3 gap-[22px]">
          {cards.map((c, i) => (
            <TiltCard key={i} delay={i * 0.08} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ icon, title, body, delay }: { icon: React.ReactNode; title: string; body: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => { if (ref.current) { ref.current.style.transition = "transform 0.5s cubic-bezier(0.2,0.6,0.2,1)"; ref.current.style.transform = ""; setTimeout(() => { if (ref.current) ref.current.style.transition = ""; }, 500); } };
  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.12s ease";
    el.style.transform = `perspective(700px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) scale(1.018)`;
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.65, delay }}
      onMouseMove={tilt} onMouseLeave={reset}
      className="bg-white border border-[#e2e8f0] rounded-[20px] p-9 cursor-default transition-[border-color,box-shadow] duration-300 hover:border-blue/40 hover:shadow-[0_28px_56px_-28px_rgba(15,23,42,0.18),0_0_0_1px_rgba(37,99,235,0.12)]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-blue/10 to-purple/10 border border-blue/[0.22] grid place-items-center text-blue mb-6 transition-all duration-300 group-hover:translate-y-[-3px]">
        {icon}
      </div>
      <h3 className="font-serif text-[24px] font-medium mb-3 text-[#0b1220]">{title}</h3>
      <p className="text-[#475569] text-[15.5px] leading-[1.6] m-0">{body}</p>
    </motion.article>
  );
}
