import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section id="book" className="section relative bg-navy text-white py-[clamp(72px,10vw,128px)] px-[clamp(20px,4vw,48px)] text-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none animate-ctaGlow"
        style={{
          background: "radial-gradient(55% 65% at 50% 50%, rgba(37,99,235,0.24), transparent 65%), radial-gradient(40% 40% at 80% 30%, rgba(124,58,237,0.2), transparent 65%)",
        }}
        aria-hidden
      />
      <div className="relative max-w-[780px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65 }}
          className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08]"
        >
          Ready
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="text-[clamp(38px,5.5vw,72px)] font-serif font-medium mt-4 mb-5"
        >
          One session. Your first AI tool.{" "}
          <span className="grad-text">Live.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-white/65 text-lg mb-10"
        >
          $250. One or two sessions. Or your money back.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.18 }}
        >
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-9 py-[22px] rounded-full bg-blue text-white text-[17px] font-semibold shadow-[0_8px_24px_-10px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-14px_rgba(37,99,235,0.8)] hover:bg-[#1d57db] transition-all duration-200"
          >
            Book a 15-min fit call
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.65, delay: 0.24 }}
          className="mt-5 text-white/50 text-[13.5px]"
        >
          No commitment. 15 minutes to see if it is a fit.
        </motion.p>
      </div>
    </section>
  );
}
