import { useRef } from "react";
import { motion } from "framer-motion";

const quotes = [
  {
    text: "I thought I needed to hire a developer. Six hours of coaching later, I had something running on the internet that my team actually uses.",
    name: "Head of Customer Success",
    co:   "SaaS company",
    featured: false,
  },
  {
    text: "The recall document alone was worth the price. I reference it every week.",
    name: "Founder",
    co:   "Professional Services",
    featured: true,
  },
  {
    text: "Ahmad built with me, not for me. By Session 2 I understood every line of what we had shipped.",
    name: "VP of Operations",
    co:   "Enterprise Software",
    featured: false,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section relative section-glow bg-navy text-white py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65 }}
          className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08]"
        >
          Voices
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="text-[clamp(34px,4.4vw,56px)] font-serif font-medium mt-[18px] mb-[18px]"
        >
          What <span className="grad-text">operators</span> say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-white/70 text-lg max-w-[680px] mb-14"
        >
          Three sentences from three sessions. The kind of feedback I save.
        </motion.p>
        <div className="grid lg:grid-cols-3 gap-[22px]">
          {quotes.map((q, i) => (
            <QuoteCard key={i} {...q} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteCard({ text, name, co, featured, delay }: {
  text: string; name: string; co: string; featured: boolean; delay: number;
}) {
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
      className={`flex flex-col rounded-[20px] p-9 cursor-default transition-all duration-300 ${
        featured
          ? "border border-blue/45 bg-blue/[0.06] shadow-[0_0_70px_-20px_rgba(37,99,235,0.45),0_0_0_1px_rgba(37,99,235,0.15)] hover:border-blue/70 hover:shadow-[0_30px_60px_-20px_rgba(37,99,235,0.5)]"
          : "bg-white/[0.03] border border-white/[0.08] hover:border-blue/30 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)]"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className={`font-serif text-[56px] leading-[0.4] mb-[18px] font-medium ${featured ? "text-blue/75" : "text-blue/50"}`}>&ldquo;</div>
      <blockquote className="m-0 font-serif italic text-[20px] text-white/95 leading-snug flex-1 mb-7">{text}</blockquote>
      <div className="border-t border-white/[0.08] pt-[18px] text-sm text-white/70 leading-snug">
        <strong className="block text-white font-semibold mb-0.5 text-sm">{name}</strong>
        {co}
      </div>
    </motion.article>
  );
}
