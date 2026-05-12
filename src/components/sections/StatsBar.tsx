import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
  return <span ref={ref}>{val}{suffix}</span>;
}

const stats = [
  { display: <Counter target={13} />, label: "Operators building" },
  { display: "$250",                   label: "Flat fee, no surprises" },
  { display: <Counter target={100} suffix="%" />, label: "Money-back guarantee" },
  { display: "9",                      label: "Stages, end to end" },
];

export default function StatsBar() {
  return (
    <div className="relative border-t border-white/[0.06] border-b border-white/[0.06] bg-gradient-to-b from-blue/[0.04] to-purple/[0.04] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(37,99,235,0.08), transparent)" }} aria-hidden />
      <div className="max-w-[1180px] mx-auto flex flex-wrap">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.65, delay: i * 0.08, ease: [0.2, 0.6, 0.2, 1] }}
            className={`flex-1 basis-[200px] max-w-[300px] text-center py-10 px-14 ${i > 0 ? "border-l border-white/[0.07]" : ""} max-sm:border-l-0 max-sm:basis-[50%] max-sm:py-7 max-sm:px-6 ${i < 2 ? "max-sm:border-b border-white/[0.07]" : ""} ${i % 2 === 0 ? "max-sm:border-r border-white/[0.07]" : ""}`}
          >
            <div className="font-serif text-[clamp(40px,5vw,60px)] font-medium leading-none tracking-[-0.03em] grad-text">
              {s.display}
            </div>
            <div className="text-[12px] text-white/45 tracking-[0.12em] uppercase font-semibold mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
