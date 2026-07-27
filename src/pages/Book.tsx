import { useState, useEffect, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  CalendarDays, Clock, User, CheckCircle2, Loader2, ChevronLeft,
  Video, Globe, ArrowRight, UserPlus, X, MessageSquare, ShieldCheck,
  ChevronDown, Zap, Wrench, Rocket,
} from "lucide-react";
import { addDays, startOfDay, isBefore, isAfter, addMonths, format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
type SessionMode = "fit" | "standard" | "deep";
interface FormData { name: string; email: string; company: string; notes: string; phone: string; }

// ── Session modes ────────────────────────────────────────────────────────────
// Three pre-set call types. URL param `?session=fit|standard|deep` selects one.
// Default is "standard" (90 min), the standard Builder Sprint session length.
interface SessionConfig {
  key:          SessionMode;
  durationMin:  number;
  durationLabel: string;       // "15 min" | "90 min" | "2 hours"
  chipLabel:    string;        // chip above hero (uppercase tracking)
  title:        string;        // tab/pill label
  blurb:        string;        // short tagline shown under pill
  heroSub:      string;        // subheading paragraph in the hero
  Icon:         React.ComponentType<{ className?: string }>;
}

const SESSION_MODES: Record<SessionMode, SessionConfig> = {
  fit: {
    key:           "fit",
    durationMin:   15,
    durationLabel: "15 min",
    chipLabel:     "15-min fit call",
    title:         "Fit Call",
    blurb:         "Quick intro. See if we are a fit.",
    heroSub:       "Free. 15 minutes. We figure out if my coaching style fits how you learn and what you should build first.",
    Icon:          Zap,
  },
  standard: {
    key:           "standard",
    durationMin:   90,
    durationLabel: "90 min",
    chipLabel:     "90-min sprint session",
    title:         "Sprint Session",
    blurb:         "Standard 90-min coaching session.",
    heroSub:       "Live 90-min Claude Code coaching. Come ready with what you want to build. We ship something real.",
    Icon:          Wrench,
  },
  deep: {
    key:           "deep",
    durationMin:   120,
    durationLabel: "2 hours",
    chipLabel:     "2-hour deep sprint",
    title:         "Deep Sprint",
    blurb:         "Two-hour deep work block.",
    heroSub:       "Two uninterrupted hours of pair-building. Best for clients tackling something complex in a single sitting.",
    Icon:          Rocket,
  },
};

function readModeFromUrl(): SessionMode {
  if (typeof window === "undefined") return "standard";
  const p = new URLSearchParams(window.location.search).get("session")?.toLowerCase() ?? "";
  if (p === "fit" || p === "15" || p === "15min")  return "fit";
  if (p === "deep" || p === "120" || p === "120min" || p === "2h") return "deep";
  if (p === "standard" || p === "90" || p === "90min" || p === "1.5h") return "standard";
  return "standard";
}

// ── Timezone list ────────────────────────────────────────────────────────────
const TIMEZONES = [
  { value: "Pacific/Honolulu",               label: "Hawaii (HST, GMT-10)" },
  { value: "America/Anchorage",              label: "Alaska (AKST, GMT-9)" },
  { value: "America/Los_Angeles",            label: "Pacific (PT, GMT-8/-7)" },
  { value: "America/Denver",                 label: "Mountain (MT, GMT-7/-6)" },
  { value: "America/Chicago",                label: "Central (CT, GMT-6/-5)" },
  { value: "America/New_York",               label: "Eastern (ET, GMT-5/-4)" },
  { value: "America/Sao_Paulo",              label: "Brazil (BRT, GMT-3)" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina (ART, GMT-3)" },
  { value: "UTC",                            label: "UTC (GMT+0)" },
  { value: "Europe/London",                  label: "London (GMT/BST)" },
  { value: "Europe/Paris",                   label: "Central Europe (CET, GMT+1/+2)" },
  { value: "Europe/Amsterdam",               label: "Netherlands (CET, GMT+1/+2)" },
  { value: "Europe/Berlin",                  label: "Germany (CET, GMT+1/+2)" },
  { value: "Europe/Istanbul",                label: "Turkey (TRT, GMT+3)" },
  { value: "Europe/Moscow",                  label: "Moscow (MSK, GMT+3)" },
  { value: "Africa/Cairo",                   label: "Cairo (EET, GMT+2)" },
  { value: "Africa/Johannesburg",            label: "South Africa (SAST, GMT+2)" },
  { value: "Asia/Riyadh",                    label: "Saudi Arabia (AST, GMT+3)" },
  { value: "Asia/Dubai",                     label: "Dubai (GST, GMT+4)" },
  { value: "Asia/Karachi",                   label: "Pakistan (PKT, GMT+5)" },
  { value: "Asia/Kolkata",                   label: "India (IST, GMT+5:30)" },
  { value: "Asia/Dhaka",                     label: "Bangladesh (BST, GMT+6)" },
  { value: "Asia/Bangkok",                   label: "Bangkok (ICT, GMT+7)" },
  { value: "Asia/Singapore",                 label: "Singapore (SGT, GMT+8)" },
  { value: "Asia/Shanghai",                  label: "China (CST, GMT+8)" },
  { value: "Asia/Tokyo",                     label: "Japan (JST, GMT+9)" },
  { value: "Asia/Seoul",                     label: "South Korea (KST, GMT+9)" },
  { value: "Australia/Sydney",               label: "Sydney (AEST, GMT+10/+11)" },
  { value: "Pacific/Auckland",               label: "New Zealand (NZST, GMT+12/+13)" },
];

// ── Helpers (ported from Ahmasoft Book.tsx) ──────────────────────────────────
function getLocalDayRange(dateStr: string, timezone: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const refNoonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(refNoonUTC);
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? "0");
  const tzHour = get("hour") === 24 ? 0 : get("hour");
  const offsetMs = refNoonUTC.getTime() - Date.UTC(get("year"), get("month") - 1, get("day"), tzHour, get("minute"), get("second"));
  const dayStartUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + offsetMs);
  const dayEndUTC   = new Date(dayStartUTC.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { dayStartUTC: dayStartUTC.toISOString(), dayEndUTC: dayEndUTC.toISOString() };
}

function formatSlotTime(isoStr: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(isoStr));
}

function getTzLabel(timezone: string) {
  return TIMEZONES.find(t => t.value === timezone)?.label ?? timezone.replace(/_/g, " ");
}

function formatBusinessHours(timezone: string) {
  // Source of truth: Supabase availability table (PKT)
  //   Mon to Fri: 13:00 to 23:00 PKT  ⇒ 08:00 to 18:00 UTC
  //   Saturday:   16:00 to 22:00 PKT  ⇒ 11:00 to 17:00 UTC
  const ref = (utcH: number, utcM: number) => new Date(Date.UTC(2026, 0, 5, utcH, utcM, 0));
  const fmt = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  const tzAbbr = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "short" }).formatToParts(ref(8, 0)).find(p => p.type === "timeZoneName")?.value ?? "";
  return { weekdays: `${fmt(ref(8, 0))} to ${fmt(ref(18, 0))}`, saturday: `${fmt(ref(11, 0))} to ${fmt(ref(17, 0))}`, tzAbbr };
}

// ── Custom Timezone Picker ───────────────────────────────────────────────────
function TimezoneSelect({
  value, onChange, verified, onVerify,
}: { value: string; onChange: (v: string) => void; verified: boolean; onVerify: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const label = TIMEZONES.find(t => t.value === value)?.label ?? value.replace(/_/g, " ");

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll the selected item into view whenever the list opens
  useEffect(() => {
    if (!open || !listRef.current) return;
    const selected = listRef.current.querySelector<HTMLElement>("[data-selected='true']");
    if (selected) selected.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); onVerify(); }}
        className={`flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-w-[240px] justify-between
          ${open
            ? "bg-blue/[0.12] border border-blue/50 text-white shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            : verified
              ? "bg-white/[0.05] border border-white/[0.12] text-white/80 hover:border-white/25 hover:bg-white/[0.08]"
              : "bg-blue/[0.08] border border-blue/40 text-white hover:border-blue/60"
          }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Globe className="w-3.5 h-3.5 text-blue flex-shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full left-1/2 -translate-x-1/2 z-[200] mt-2 w-80 max-h-64 overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0a1120] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)] py-2"
          >
            {!TIMEZONES.find(t => t.value === value) && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full px-4 py-2.5 text-left text-[13px] text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {value.replace(/_/g, " ")} <span className="text-white/30">(auto-detected)</span>
              </button>
            )}
            {TIMEZONES.map(tz => (
              <button
                type="button"
                key={tz.value}
                data-selected={tz.value === value}
                onClick={() => { onChange(tz.value); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors flex items-center justify-between gap-2 ${
                  tz.value === value
                    ? "text-blue bg-blue/[0.12] font-semibold"
                    : "text-white/65 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {tz.label}
                {tz.value === value && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-blue" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Session mode selector ────────────────────────────────────────────────────
function SessionModeSelector({ mode, onChange }: { mode: SessionMode; onChange: (m: SessionMode) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-[760px] mx-auto">
      {(Object.keys(SESSION_MODES) as SessionMode[]).map((key) => {
        const m       = SESSION_MODES[key];
        const Icon    = m.Icon;
        const active  = mode === key;
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.15 }}
            className={`group relative text-left p-4 rounded-xl border transition-colors duration-200 ${
              active
                ? "bg-blue/[0.1] border-blue/55 shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_8px_24px_-10px_rgba(37,99,235,0.5)]"
                : "bg-white/[0.025] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors duration-200 ${
                active ? "border-blue/55 bg-blue/[0.14] text-blue" : "border-white/[0.09] bg-white/[0.03] text-white/40 group-hover:text-white/65"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`font-serif text-[16px] font-medium leading-tight ${active ? "text-white" : "text-white/85"}`}>{m.title}</span>
                  <span className={`text-[11px] font-semibold tracking-[0.06em] uppercase ${active ? "text-blue" : "text-white/30"}`}>{m.durationLabel}</span>
                </div>
                <p className={`text-[12.5px] leading-snug mt-1 ${active ? "text-white/65" : "text-white/40"}`}>{m.blurb}</p>
              </div>
              {active && (
                <CheckCircle2 className="w-4 h-4 text-blue flex-shrink-0 mt-1" />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Date",  Icon: CalendarDays },
  { num: 2, label: "Time",  Icon: Clock },
  { num: 3, label: "Details", Icon: User },
];

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.Icon;
        const done   = step > s.num;
        const active = step === s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done
                  ? "bg-blue border-blue text-white shadow-[0_0_20px_-2px_rgba(37,99,235,0.7)]"
                  : active
                    ? "border-blue text-blue bg-blue/[0.08] shadow-[0_0_0_5px_rgba(37,99,235,0.1),0_0_20px_-6px_rgba(37,99,235,0.5)]"
                    : "border-white/[0.1] text-white/25 bg-white/[0.02]"
              }`}>
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors duration-300 ${
                active ? "text-blue" : done ? "text-blue/60" : "text-white/25"
              }`}>{s.label}</span>
            </div>
            {i < 2 && (
              <div className="relative mx-2 mb-5 w-14 sm:w-20 h-px overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.07] rounded-full" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue/60 to-blue/20 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [mode, setMode]                   = useState<SessionMode>(() => readModeFromUrl());
  const session = SESSION_MODES[mode];

  const [selectedTz, setSelectedTz]       = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [tzVerified, setTzVerified]       = useState(false);
  const [step, setStep]                   = useState<Step>(1);
  const [selectedDate, setSelectedDate]   = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot]   = useState<string | null>(null);
  const [slots, setSlots]                 = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [form, setForm]                   = useState<FormData>({ name: "", email: "", company: "", notes: "", phone: "" });
  const [errors, setErrors]               = useState<Partial<FormData>>({});
  const [guestEmails, setGuestEmails]     = useState<string[]>([]);
  const [guestInput, setGuestInput]       = useState("");
  const [guestError, setGuestError]       = useState("");

  const minDate = addDays(startOfDay(new Date()), 1);
  const maxDate = addMonths(new Date(), 1);

  // Sync URL with selected mode (so links shared from this view preserve mode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (mode === "standard") url.searchParams.delete("session");
    else url.searchParams.set("session", mode);
    window.history.replaceState(null, "", url.toString());
  }, [mode]);

  // Changing mode invalidates the currently-selected slot (different overlap math)
  useEffect(() => {
    setSelectedSlot(null);
    setSlots([]);
    if (selectedDate) setStep(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { dayStartUTC, dayEndUTC } = getLocalDayRange(dateStr, selectedTz);
    setSlots([]); setSelectedSlot(null); setLoadingSlots(true);
    supabase.functions.invoke("get-slots", { body: { dayStartUTC, dayEndUTC, durationMin: session.durationMin } })
      .then(({ data, error }) => {
        if (error) toast.error("Could not load available times. Please try again.");
        else setSlots(data?.slots ?? []);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedTz, session.durationMin]);

  // Compute "ends at" label for the selected slot, e.g. "01:00 PM → 02:30 PM"
  const slotEndLabel = useMemo(() => {
    if (!selectedSlot) return "";
    const end = new Date(new Date(selectedSlot).getTime() + session.durationMin * 60 * 1000);
    return formatSlotTime(end.toISOString(), selectedTz);
  }, [selectedSlot, session.durationMin, selectedTz]);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function addGuest() {
    const g = guestInput.trim().toLowerCase();
    if (!emailRe.test(g))                    { setGuestError("Enter a valid email."); return; }
    if (g === form.email.trim().toLowerCase()) { setGuestError("Same as your own email."); return; }
    if (guestEmails.includes(g))             { setGuestError("Already added."); return; }
    if (guestEmails.length >= 5)             { setGuestError("Maximum 5 guests."); return; }
    setGuestEmails(p => [...p, g]); setGuestInput(""); setGuestError("");
  }
  function validateForm() {
    const e: Partial<FormData> = {};
    if (!form.name.trim())         e.name  = "Name is required.";
    if (!emailRe.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.trim()) {
      const d = form.phone.replace(/\D/g, "");
      if (d.length < 6 || d.length > 15) e.phone = "Enter a valid phone number.";
    }
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !selectedSlot) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: {
          name:            form.name.trim(),
          email:           form.email.trim().toLowerCase(),
          company:         form.company.trim() || undefined,
          notes:           form.notes.trim()   || undefined,
          phone:           form.phone.trim()   || undefined,
          scheduledAt:     selectedSlot,
          visitorTimezone: selectedTz,
          guestEmails:     guestEmails.length > 0 ? guestEmails : undefined,
          source:          "coaching-website",
          durationMin:     session.durationMin,
        },
      });
      if (error || !data?.success) {
        const msg = data?.error || "Booking failed. Please try again.";
        if (msg.includes("just taken") || msg.includes("slot")) {
          const ds = format(selectedDate!, "yyyy-MM-dd");
          const { dayStartUTC, dayEndUTC } = getLocalDayRange(ds, selectedTz);
          supabase.functions.invoke("get-slots", { body: { dayStartUTC, dayEndUTC, durationMin: session.durationMin } })
            .then(({ data }) => setSlots(data?.slots ?? []));
          setSelectedSlot(null); setStep(2);
        }
        toast.error(msg); return;
      }
      setStep(4);
    } catch { toast.error("An unexpected error occurred."); }
    finally { setSubmitting(false); }
  }

  function reset() {
    setStep(1); setSelectedDate(undefined); setSelectedSlot(null); setSlots([]);
    setForm({ name: "", email: "", company: "", notes: "", phone: "" });
    setErrors({}); setGuestEmails([]); setGuestInput("");
  }

  const slide = { enter: { opacity: 0, x: 32 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -32 } };
  const { weekdays, saturday, tzAbbr } = formatBusinessHours(selectedTz);

  return (
    <div className="min-h-screen bg-navy text-white">
      <Helmet>
        <title>Book a {session.title} · Ahmad Shayan Coaching</title>
        <meta name="description" content={
          mode === "fit"
            ? "Book a free 15-minute fit call. See if Claude Code coaching is right for you."
            : `Book a ${session.durationLabel} ${session.title.toLowerCase()} with Ahmad. Live Claude Code coaching. Pick a date and time that works for you.`
        } />
      </Helmet>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="pt-[110px] pb-8 px-[clamp(20px,4vw,48px)] text-center relative"
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(50% 80% at 50% 0%, rgba(37,99,235,0.16), transparent 70%)" }}
          aria-hidden />
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.span
              key={`chip-${mode}`}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="inline-block text-[11px] font-semibold tracking-[0.16em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08] mb-4"
            >
              {session.chipLabel}
            </motion.span>
          </AnimatePresence>
          <h1 className="font-serif text-[clamp(28px,4.5vw,52px)] font-medium mb-3 leading-tight">
            Book a {session.title.toLowerCase()} with Ahmad
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={`hero-${mode}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-white/55 text-base mb-7 max-w-[480px] mx-auto"
            >
              {session.heroSub}
            </motion.p>
          </AnimatePresence>

          {/* Session mode selector */}
          <div className="mb-8">
            <SessionModeSelector mode={mode} onChange={setMode} />
          </div>

          {/* Timezone picker */}
          <div className="flex flex-col items-center gap-2.5">
            <span className="flex items-center gap-2 text-[13px] text-white/45">
              <Globe className="w-3.5 h-3.5" />
              Times shown in your timezone:
            </span>
            <TimezoneSelect
              value={selectedTz}
              onChange={(v) => { setSelectedTz(v); setSelectedSlot(null); }}
              verified={tzVerified}
              onVerify={() => setTzVerified(true)}
            />
            {!tzVerified && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-[12px] text-amber/80 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block animate-pulse" />
                Please confirm your timezone before picking a date
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Booking card ── */}
      <div className="max-w-[720px] mx-auto px-[clamp(16px,4vw,40px)] pb-20">
        {step < 4 && <StepIndicator step={step} />}

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm">
          <AnimatePresence mode="wait">

            {/* ─── Step 1: Calendar ─── */}
            {step === 1 && (
              <motion.div key="s1" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}
                className="p-[clamp(24px,5vw,44px)]">
                <h2 className="font-serif text-[22px] font-medium text-white mb-6">Choose a date</h2>

                {/* Calendar panel */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 sm:p-7 flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); if (d) { setStep(2); } }}
                    disabled={(d) => isBefore(d, minDate) || isAfter(d, maxDate)}
                    classNames={{ root: "rdp-coaching" }}
                  />
                </div>

                {/* Business hours */}
                <div className="mt-5 flex items-start gap-3 px-4 py-3.5 bg-blue/[0.05] border border-blue/[0.14] rounded-xl">
                  <Clock className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
                  <div className="text-[13px] text-white/55 leading-relaxed">
                    <span className="text-white/75 font-medium">Mon to Fri:</span> {weekdays} {tzAbbr}
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    <span className="text-white/75 font-medium">Sat:</span> {saturday} {tzAbbr}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Time slots ─── */}
            {step === 2 && (
              <motion.div key="s2" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}
                className="p-[clamp(24px,5vw,44px)]">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)}
                    className="w-9 h-9 rounded-full border border-white/[0.12] grid place-items-center text-white/50 hover:border-white/30 hover:text-white transition-all flex-shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="font-serif text-[22px] font-medium text-white leading-tight">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Pick a time"}
                    </h2>
                    <p className="text-[13px] text-white/40 mt-0.5">
                      Select a start time · <span className="text-blue/80 font-medium">{session.durationLabel} {session.title.toLowerCase()}</span>
                    </p>
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40">
                    <Loader2 className="w-6 h-6 animate-spin text-blue" />
                    <span className="text-sm">Loading available times...</span>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-14">
                    <Clock className="w-10 h-10 mx-auto mb-4 text-white/15" />
                    <p className="text-white/50 font-medium mb-1">No slots available on this day</p>
                    <p className="text-sm text-white/30 mb-6">Try a different date</p>
                    <button onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-full border border-white/[0.14] text-white/60 text-sm hover:border-white/30 hover:text-white transition-all">
                      Choose another date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {slots.map(slot => (
                      <motion.button key={slot}
                        onClick={() => { setSelectedSlot(slot); setStep(3); }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="relative px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[14px] font-medium text-white/70 text-center transition-colors duration-200 hover:border-blue/50 hover:bg-blue/[0.08] hover:text-white hover:shadow-[0_6px_20px_-6px_rgba(37,99,235,0.35)]">
                        {formatSlotTime(slot, selectedTz)}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── Step 3: Contact form ─── */}
            {step === 3 && (
              <motion.div key="s3" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}
                className="p-[clamp(24px,5vw,44px)]">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(2)}
                    className="w-9 h-9 rounded-full border border-white/[0.12] grid place-items-center text-white/50 hover:border-white/30 hover:text-white transition-all flex-shrink-0">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="font-serif text-[22px] font-medium text-white leading-tight">Your details</h2>
                    {selectedDate && selectedSlot && (
                      <p className="text-[13px] text-blue font-semibold mt-0.5">
                        {format(selectedDate, "MMMM d, yyyy")} · {formatSlotTime(selectedSlot, selectedTz)}
                        <span className="text-white/40 font-normal"> → </span>
                        <span className="text-white/70">{slotEndLabel}</span>
                        <span className="text-white/35 font-normal ml-1.5">({session.durationLabel})</span>
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required error={errors.name}>
                      <input type="text" placeholder="Jane Smith" value={form.name} autoComplete="name"
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })); }}
                        className={`form-input ${errors.name ? "border-red-500/60" : ""}`} />
                    </Field>
                    <Field label="Email Address" required error={errors.email}>
                      <input type="email" placeholder="you@company.com" value={form.email} autoComplete="email"
                        onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(er => ({ ...er, email: undefined })); }}
                        className={`form-input ${errors.email ? "border-red-500/60" : ""}`} />
                    </Field>
                  </div>

                  <Field label="Company / Organization" optional>
                    <input type="text" placeholder="Acme Corp (optional)" value={form.company} autoComplete="organization"
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="form-input" />
                  </Field>

                  <Field label="WhatsApp / Phone" optional icon={<MessageSquare className="w-3.5 h-3.5 text-blue" />}
                    hint="Share your number for a WhatsApp follow-up after the call." error={errors.phone}>
                    <input type="tel" placeholder="+1 555 000 0000" value={form.phone} autoComplete="tel"
                      onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); if (errors.phone) setErrors(er => ({ ...er, phone: undefined })); }}
                      className={`form-input ${errors.phone ? "border-red-500/60" : ""}`} />
                  </Field>

                  <Field label={mode === "fit" ? "What do you want to discuss?" : "What do you want to build?"}>
                    <textarea rows={3} value={form.notes}
                      placeholder={mode === "fit"
                        ? "Quick context on what you are hoping to learn or build..."
                        : "Briefly describe what you are hoping to ship with Claude Code..."}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="form-input resize-none" />
                  </Field>

                  {/* Guests */}
                  <Field label="Invite others" optional icon={<UserPlus className="w-3.5 h-3.5 text-blue" />}
                    hint="Add a co-founder or teammate. They will get the same calendar invite.">
                    <div className="flex gap-2.5">
                      <input type="email" placeholder="colleague@company.com" value={guestInput}
                        disabled={guestEmails.length >= 5}
                        onChange={e => { setGuestInput(e.target.value); setGuestError(""); }}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGuest(); } }}
                        className="form-input flex-1 disabled:opacity-40" />
                      <button type="button" onClick={addGuest}
                        disabled={!guestInput.trim() || guestEmails.length >= 5}
                        className="px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-[13px] font-medium text-white/55 hover:border-blue/45 hover:text-blue hover:bg-blue/[0.06] transition-all duration-200 disabled:opacity-30 flex-shrink-0">
                        Add
                      </button>
                    </div>
                    {guestError && <p className="text-red-400 text-xs mt-1">{guestError}</p>}
                    {guestEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {guestEmails.map(g => (
                          <span key={g} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue/[0.1] text-blue border border-blue/[0.22]">
                            {g}
                            <button type="button" onClick={() => setGuestEmails(p => p.filter(x => x !== g))} className="hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </Field>

                  <div className="flex items-center gap-3 px-4 py-3.5 bg-blue/[0.04] border border-blue/[0.12] rounded-xl text-[13px] text-white/45 leading-relaxed">
                    <div className="w-7 h-7 rounded-lg bg-blue/[0.1] border border-blue/[0.2] flex items-center justify-center flex-shrink-0">
                      <Video className="w-3.5 h-3.5 text-blue" />
                    </div>
                    <span>A Google Meet link will be sent in your confirmation email. Free, no credit card needed.</span>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 py-[17px] rounded-full bg-blue text-white text-[15px] font-semibold shadow-[0_8px_24px_-10px_rgba(37,99,235,0.65)] hover:-translate-y-px hover:bg-[#1d57db] hover:shadow-[0_16px_36px_-12px_rgba(37,99,235,0.8)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2">
                    {submitting
                      ? <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Booking your call...</>
                      : <>Confirm Booking <ArrowRight className="w-[18px] h-[18px]" /></>
                    }
                  </button>
                </form>
              </motion.div>
            )}

            {/* ─── Step 4: Confirmation ─── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, type: "spring", damping: 20 }}
                className="p-[clamp(24px,5vw,44px)] text-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                  className="w-[72px] h-[72px] rounded-full bg-green/[0.12] border-2 border-green/[0.35] flex items-center justify-center mx-auto mb-6"
                >
                  <ShieldCheck className="w-9 h-9 text-green" />
                </motion.div>
                <h2 className="font-serif text-[clamp(24px,3.5vw,36px)] font-medium text-white mb-3">You are booked!</h2>
                <p className="text-white/55 text-base mb-2 max-w-[400px] mx-auto">
                  Confirmation sent to <strong className="text-white font-medium">{form.email}</strong>. Check your inbox for the Google Meet link.
                </p>
                {guestEmails.length > 0 && (
                  <p className="text-sm text-white/40 mb-6">Invites sent to: <span className="text-white/60">{guestEmails.join(", ")}</span></p>
                )}
                {selectedDate && selectedSlot && (
                  <div className="inline-block bg-blue/[0.07] border border-blue/[0.2] rounded-2xl px-6 py-4 mb-7 text-left mx-auto">
                    <div className="flex items-center gap-2.5 text-blue font-semibold mb-1.5 text-[15px]">
                      <CalendarDays className="w-4 h-4" />
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2.5 text-white/50 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSlotTime(selectedSlot, selectedTz)} → {slotEndLabel} &nbsp;·&nbsp; {session.durationLabel} {session.title} &nbsp;·&nbsp; {getTzLabel(selectedTz)}
                    </div>
                  </div>
                )}
                <p className="text-sm text-white/35 mb-7">Can not make it? Reply to the confirmation email to reschedule.</p>
                <button onClick={reset}
                  className="px-7 py-3 rounded-full border border-white/[0.15] text-white/65 font-medium hover:border-white/30 hover:text-white transition-all text-sm">
                  Book another call
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Trust badges */}
        {step < 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12.5px] text-white/30">
            {[
              mode === "fit" ? "Free, no credit card" : "Calendar invite sent",
              session.durationLabel,
              "Cancel anytime",
              "Instant confirmation",
            ].map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {i > 0 && <span className="hidden sm:block w-px h-3 bg-white/10 mr-2" />}
                <CheckCircle2 className="w-3.5 h-3.5 text-green/70 flex-shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Shared form field wrapper ─────────────────────────────────────────────────
function Field({ label, required, optional, icon, hint, error, children }: {
  label: string; required?: boolean; optional?: boolean;
  icon?: React.ReactNode; hint?: string; error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold tracking-[0.04em] uppercase text-white/45 flex items-center gap-1.5">
        {icon}{label}
        {required && <span className="text-red-400/80 font-normal normal-case tracking-normal">*</span>}
        {optional && <span className="text-white/25 font-normal normal-case tracking-normal text-[11px] ml-0.5">(optional)</span>}
      </label>
      {hint && <p className="text-[12px] text-white/30 -mt-0.5 leading-relaxed">{hint}</p>}
      {children}
      {error && (
        <p className="text-red-400/90 text-[12px] flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400/90 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}
