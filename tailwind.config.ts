import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans:  ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        navy:    { DEFAULT: "#0F172A", 2: "#111c36" },
        blue:    { DEFAULT: "#2563EB", 2: "#3b82f6", glow: "rgba(37,99,235,0.45)" },
        purple:  { DEFAULT: "#7C3AED", 2: "#a855f7" },
        green:   { DEFAULT: "#16A34A" },
        amber:   { DEFAULT: "#d97706" },
        muted:   { DEFAULT: "#475569", 2: "#64748b" },
      },
      keyframes: {
        floatA: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%":      { transform: "translate3d(40px,30px,0)" },
        },
        floatB: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%":      { transform: "translate3d(-50px,-40px,0)" },
        },
        floatC: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%":      { transform: "translate3d(20px,36px,0)" },
        },
        gridDrift: {
          "0%":   { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "56px 56px, 56px 56px" },
        },
        priceBreath: {
          "0%,100%": { boxShadow: "0 0 50px -12px rgba(37,99,235,0.35), inset 0 0 0 1px rgba(255,255,255,0.02)" },
          "50%":      { boxShadow: "0 0 100px -8px rgba(37,99,235,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)" },
        },
        gradPan: {
          "0%":   { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "250% center" },
        },
        shimmerSweep: {
          "0%":      { left: "-80%" },
          "60%,100%": { left: "160%" },
        },
        shieldPulse: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(22,163,74,0.3)" },
          "50%":      { boxShadow: "0 0 0 10px rgba(22,163,74,0)" },
        },
        trustPulse: {
          "0%,100%": { boxShadow: "0 0 8px rgba(22,163,74,0.5)" },
          "50%":      { boxShadow: "0 0 18px rgba(22,163,74,0.9)" },
        },
        cardFloat: {
          "0%,100%": { transform: "perspective(1200px) rotateY(-6deg) rotateX(3deg) translateY(0)" },
          "50%":      { transform: "perspective(1200px) rotateY(-6deg) rotateX(3deg) translateY(-10px)" },
        },
        pingRing: {
          "0%":   { transform: "scale(0.95)", opacity: "0.8" },
          "100%": { transform: "scale(1.15)", opacity: "0" },
        },
        ctaGlow: {
          "0%":   { opacity: "0.7" },
          "100%": { opacity: "1" },
        },
        priceGlow: {
          "0%,100%": { textShadow: "0 0 30px rgba(37,99,235,0.4), 0 0 60px rgba(37,99,235,0.2)" },
          "50%":      { textShadow: "0 0 60px rgba(37,99,235,0.8), 0 0 120px rgba(37,99,235,0.45)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        floatA:        "floatA 14s ease-in-out infinite",
        floatB:        "floatB 18s ease-in-out infinite",
        floatC:        "floatC 12s ease-in-out infinite",
        gridDrift:     "gridDrift 24s linear infinite",
        priceBreath:   "priceBreath 4s ease-in-out infinite",
        gradPan:       "gradPan 6s linear infinite",
        shimmerSweep:  "shimmerSweep 5s ease-in-out infinite",
        shieldPulse:   "shieldPulse 3s ease-in-out infinite",
        trustPulse:    "trustPulse 2s ease-in-out infinite",
        cardFloat:     "cardFloat 7s ease-in-out infinite",
        pingRing:      "pingRing 1.5s cubic-bezier(0,0,0.2,1) infinite",
        ctaGlow:       "ctaGlow 6s ease-in-out infinite alternate",
        priceGlow:     "priceGlow 3s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
