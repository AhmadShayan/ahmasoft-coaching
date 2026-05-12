import { motion } from "framer-motion";
import { ExternalLink, Linkedin } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="section relative section-glow-light bg-white text-[#0b1220] py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)]">
      <div className="max-w-[1180px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65 }}
            className="aspect-square rounded-[24px] bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] overflow-hidden relative max-w-[380px] lg:max-w-none shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.06)] group"
          >
            <img
              src="/assets/ahmad-shayan.jpg"
              alt="Portrait of Ahmad Shayan"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue/[0.18] pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            <span className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.22] bg-blue/[0.07]">
              About Ahmad
            </span>
            <h3 className="font-serif text-[clamp(30px,3.5vw,44px)] font-medium mt-4 mb-5 text-[#0b1220]">
              AI builder. <span className="grad-text-light">Coach.</span> Maker.
            </h3>
            <p className="text-[#475569] text-[17px] leading-[1.65] mb-5 max-w-[540px]">
              I am Ahmad Shayan, founder of Ahmasoft. I build production AI systems for companies and coach non-technical leaders to do the same.
            </p>
            <p className="text-[#475569] text-[17px] leading-[1.65] mb-5 max-w-[540px]">
              Since 2024 I have worked with 13 operators across NVIDIA, Salesforce, Adobe, and more, helping them ship their first AI tools without hiring engineers.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-1">
              <a
                href="https://ahmadshayan.com"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-blue font-semibold text-[15px] border-b border-transparent hover:border-blue hover:translate-x-[3px] transition-all duration-200"
              >
                ahmadshayan.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ehmadshayan"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-blue font-semibold text-[15px] border-b border-transparent hover:border-blue hover:translate-x-[3px] transition-all duration-200"
              >
                LinkedIn
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
