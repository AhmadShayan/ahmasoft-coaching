import { motion } from "framer-motion";

const stages = [
  { n: 1, title: "Vision capture",               time: "about 10 min" },
  { n: 2, title: "Claude.ai and API setup",       time: "about 20 min" },
  { n: 3, title: "VS Code and Claude Code CLI",   time: "about 25 min" },
  { n: 4, title: "GitHub setup",                  time: "about 15 min" },
  { n: 5, title: "Vercel and first deploy",        time: "about 15 min" },
  { n: "break" as const, title: "", time: "" },
  { n: 6, title: "Plan the real build",           time: "about 10 min" },
  { n: 7, title: "Live pair-build",               time: "about 40 min" },
  { n: 8, title: "Commit to GitHub",              time: "about 10 min" },
  { n: 9, title: "Deploy your AI tool",           time: "about 15 min" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section relative section-glow-light bg-white text-[#0b1220] py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65 }}
          className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.22] bg-blue/[0.07]"
        >
          Process
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="text-[clamp(34px,4.4vw,56px)] font-serif font-medium mt-[18px] mb-[18px] text-[#0b1220]"
        >
          How the <span className="grad-text-light">Sprint</span> works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-[#475569] text-lg max-w-[680px] mb-14"
        >
          Nine stages. Live, paired, end to end. We start with vision and end with your tool on the internet.
        </motion.p>

        <div className="relative pl-1">
          {/* Rail */}
          <div className="absolute left-[31px] top-8 bottom-8 w-0.5 rounded-full" style={{ background: "linear-gradient(180deg, rgba(37,99,235,0), rgba(37,99,235,0.22) 10%, rgba(124,58,237,0.22) 90%, rgba(124,58,237,0))" }} aria-hidden />

          {stages.map((s, i) => {
            if (s.n === "break") {
              return (
                <motion.div
                  key="break"
                  initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
                  transition={{ duration: 0.65, delay: 0.04 }}
                  className="my-2 ml-[86px] max-sm:ml-0"
                >
                  <span className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] rounded-full text-[13px] font-semibold shadow-[0_0_20px_-8px_rgba(217,119,6,0.3)] before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#d97706] before:animate-pulse">
                    Most two-session clients pause here
                  </span>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
                transition={{ duration: 0.65, delay: i * 0.04 }}
                className="group relative z-10 grid grid-cols-[64px_1fr] max-sm:grid-cols-[52px_1fr] gap-5 max-sm:gap-4 items-center py-3.5"
              >
                <div className="w-16 h-16 max-sm:w-[52px] max-sm:h-[52px] rounded-full bg-white border-2 border-[#e2e8f0] grid place-items-center font-serif text-[22px] max-sm:text-lg text-[#0b1220] font-medium z-10 transition-all duration-300 group-hover:border-blue group-hover:text-blue group-hover:scale-[1.06] group-hover:shadow-[0_0_0_6px_rgba(37,99,235,0.08),0_0_20px_-6px_rgba(37,99,235,0.4)]">
                  {s.n}
                </div>
                <div className="flex justify-between items-baseline gap-4 flex-wrap">
                  <span className="font-serif text-[clamp(20px,1.8vw,24px)] font-medium text-[#0b1220] tracking-[-0.01em] transition-colors duration-200 group-hover:text-blue">{s.title}</span>
                  <span className="text-sm text-[#475569] font-variant-numeric tabular-nums">{s.time}</span>
                </div>
              </motion.div>
            );
          })}

          <motion.p
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65 }}
            className="mt-11 pl-[86px] max-sm:pl-0 text-[#475569] text-base leading-relaxed max-w-[760px]"
          >
            Most clients finish in two sessions of about 90 min each. Technical clients often do two sessions of an hour each. Some prefer one longer 2.5-hour sitting. We pace to fit you.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
