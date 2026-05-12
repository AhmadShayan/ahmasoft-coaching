import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const items = [
  { b: "Live Builder Sprint", t: "1 or 2 sessions, about 3 hours total" },
  { b: "All five accounts wired", t: "Claude.ai, Claude API, VS Code, GitHub, Vercel" },
  { b: "A real AI tool", t: "built and deployed under your GitHub" },
  { b: "25-page recall document", t: "yours forever" },
  { b: "30-day support", t: "for blockers after the Sprint" },
  { b: "Path to $50/hr ongoing coaching", t: "if you want it" },
];

export default function SprintOffer() {
  return (
    <section id="sprint" className="relative section-glow bg-navy text-white py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65 }}
          className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08]"
        >
          The Sprint
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="text-[clamp(34px,4.4vw,56px)] font-serif font-medium mt-[18px] mb-[18px]"
        >
          What you get for <span className="grad-text">$250</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-white/70 text-lg max-w-[680px] mb-14"
        >
          A flat-fee Builder Sprint. Live, hands-on, judgement-free. You leave with a working AI tool and a recall doc you keep forever.
        </motion.p>

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-10 items-start">
          {/* Checklist */}
          <ul className="flex flex-col gap-3.5 list-none m-0 p-0">
            {items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
                transition={{ duration: 0.65, delay: i * 0.06 }}
                className="flex items-start gap-3.5 px-[18px] py-4 bg-white/[0.03] border border-white/[0.06] rounded-[12px] text-base text-white/86 leading-snug transition-all duration-200 hover:border-blue/30 hover:bg-blue/[0.04] hover:translate-x-[3px]"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green/[0.15] border border-green/45 grid place-items-center text-green mt-px">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
                <span><strong className="font-semibold">{item.b}</strong> &nbsp;·&nbsp; {item.t}</span>
              </motion.li>
            ))}
          </ul>

          {/* Value box */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="value-box-shimmer relative bg-gradient-to-b from-blue/[0.08] to-purple/[0.06] border border-blue/[0.28] rounded-[20px] p-9 text-center overflow-hidden shadow-[0_0_80px_-20px_rgba(37,99,235,0.35)]"
          >
            <div className="text-[13px] text-white/60 tracking-[0.12em] uppercase font-semibold">Stacked value</div>
            <div className="font-serif text-[30px] text-white/85 line-through decoration-white/35 mt-1.5 mb-5 font-medium">$1,650</div>
            <div className="text-sm text-white/70 mb-1">Your price</div>
            <div className="font-serif text-[clamp(72px,8vw,96px)] text-blue-400 font-medium leading-none tracking-[-0.02em] [animation:priceGlow_3s_ease-in-out_infinite]">$250</div>
            <div className="mt-3.5 text-sm text-white/65 tracking-[0.04em]">
              <strong className="text-green font-semibold">6.6x</strong> value for money
            </div>
          </motion.aside>
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.20 }}
          className="mt-9 flex items-start gap-[18px] px-7 py-6 bg-green/[0.08] border border-green/[0.32] rounded-[16px] transition-all duration-300 hover:border-green/55 hover:bg-green/[0.11]"
        >
          <span className="flex-shrink-0 w-11 h-11 rounded-[12px] bg-green/[0.18] text-green grid place-items-center animate-shieldPulse">
            <ShieldCheck className="w-[22px] h-[22px]" />
          </span>
          <p className="m-0 text-base text-white/92 leading-snug">
            If you do not have a working AI tool deployed by the end of your Sprint,{" "}
            <strong className="text-green-400 font-semibold">I refund every dollar.</strong>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
