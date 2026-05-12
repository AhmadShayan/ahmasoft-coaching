import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Do I need to be technical?",
    a: "No. Most clients are VPs and directors with no coding background. Setup is point-and-click. Building is conversational. You prompt, Claude codes.",
  },
  {
    q: "How long does the Sprint take?",
    a: "Most clients finish in two sessions of about 90 minutes each. Technical clients often do two sessions of an hour each. Some prefer one longer sitting. We pace to fit you, not a fixed clock.",
  },
  {
    q: "What if I do not know what I want to build?",
    a: "That is what the first 10 minutes are for. Clients arrive with a vague idea and leave with a concrete plan.",
  },
  {
    q: "Will I need to pay for Claude API?",
    a: "Yes, but it is small. Plan on $5 to $15 a month as you build. I will teach you cost controls in Session 1.",
  },
  {
    q: "What happens after the Sprint?",
    a: "You leave with everything working and a recall doc as your reference. About 70% of clients come back for ongoing $50/hr coaching. 30% take it from there on their own.",
  },
  {
    q: "What is the refund policy?",
    a: "If you do not have a working AI tool deployed by the end of your Sprint, I refund the full $250. No forms, no friction.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="section relative section-glow-light bg-[#f1f5f9] text-[#0b1220] py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65 }}
            className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.22] bg-blue/[0.07]"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65, delay: 0.06 }}
            className="text-[clamp(34px,4.4vw,56px)] font-serif font-medium mt-[18px] text-[#0b1220]"
          >
            Questions you are <span className="grad-text-light">probably thinking</span>
          </motion.h2>
        </div>
        <div className="max-w-[820px] mx-auto">
          {faqs.map((f, i) => (
            <FAQItem key={i} {...f} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.65, delay }}
      className="border-t border-[#e2e8f0] last:border-b py-[22px]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-6 text-left"
        aria-expanded={open}
      >
        <span className="font-serif text-[clamp(20px,2vw,24px)] font-medium text-[#0b1220] leading-snug hover:text-blue transition-colors">{q}</span>
        <span className="flex-shrink-0 mt-1 w-5 h-5 text-blue transition-transform duration-200">
          {open ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden mt-3.5 text-[#475569] text-[16.5px] leading-relaxed max-w-[720px]"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
