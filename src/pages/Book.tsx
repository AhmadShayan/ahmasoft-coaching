import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  CalendarDays, Clock, User, CheckCircle2, Loader2, ChevronLeft,
  Video, Globe, ArrowRight, UserPlus, X, MessageSquare, ShieldCheck,
} from "lucide-react";
import { addDays, startOfDay, isBefore, isAfter, addMonths, format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;
interface FormData { name: string; email: string; company: string; notes: string; phone: string; }

// ── Timezone list ──────────────────────────────────────────────────────────
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

// ── Helpers (from Ahmasoft Book.tsx) ─────────────────────────────────────
function getLocalDayRange(dateStr: string, timezone: string): { dayStartUTC: string; dayEndUTC: string } {
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

function formatSlotTime(isoStr: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(isoStr));
}

function getTzLabel(timezone: string): string {
  return TIMEZONES.find(t => t.value === timezone)?.label ?? timezone.replace(/_/g, " ");
}

function formatBusinessHours(timezone: string) {
  const ref = (utcH: number, utcM: number) => new Date(Date.UTC(2026, 0, 5, utcH, utcM, 0));
  const fmt = (d: Date) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  const tzAbbr = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "short" }).formatToParts(ref(8, 0)).find(p => p.type === "timeZoneName")?.value ?? "";
  return { weekdays: `${fmt(ref(8, 0))} to ${fmt(ref(17, 30))}`, saturday: `${fmt(ref(11, 0))} to ${fmt(ref(16, 30))}`, tzAbbr };
}

// ── Step indicator ────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Pick Date",  Icon: CalendarDays },
  { num: 2, label: "Pick Time",  Icon: Clock },
  { num: 3, label: "Your Info",  Icon: User },
  { num: 4, label: "Confirmed",  Icon: CheckCircle2 },
];

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.slice(0, 3).map((s, i) => {
        const Icon = s.Icon;
        const active    = step === s.num;
        const completed = step > s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                completed ? "bg-blue border-blue text-white" : active ? "border-blue text-blue bg-blue/10" : "border-white/20 text-white/40"
              }`}>
                {completed ? <CheckCircle2 className="w-[18px] h-[18px]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-semibold tracking-[0.06em] uppercase ${active ? "text-blue" : completed ? "text-green/80" : "text-white/40"}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`h-px w-16 md:w-20 mx-2 mb-4 rounded-full transition-colors duration-300 ${step > s.num ? "bg-blue/50" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function BookPage() {
  const [selectedTimezone, setSelectedTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timezoneVerified, setTimezoneVerified] = useState(false);
  const [step, setStep]               = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slots, setSlots]             = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm]               = useState<FormData>({ name: "", email: "", company: "", notes: "", phone: "" });
  const [errors, setErrors]           = useState<Partial<FormData>>({});
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [guestInput, setGuestInput]   = useState("");
  const [guestError, setGuestError]   = useState("");

  const minDate = addDays(startOfDay(new Date()), 1);
  const maxDate = addMonths(new Date(), 1);

  // Load slots on date change
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const { dayStartUTC, dayEndUTC } = getLocalDayRange(dateStr, selectedTimezone);
    setSlots([]); setSelectedSlot(null); setLoadingSlots(true);
    supabase.functions.invoke("get-slots", { body: { dayStartUTC, dayEndUTC } })
      .then(({ data, error }) => {
        if (error) toast.error("Could not load available times. Please try again.");
        else setSlots(data?.slots ?? []);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedTimezone]);

  // Validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function addGuest() {
    const g = guestInput.trim().toLowerCase();
    if (!emailRe.test(g))                    { setGuestError("Enter a valid email address."); return; }
    if (g === form.email.trim().toLowerCase()) { setGuestError("Same as your own email."); return; }
    if (guestEmails.includes(g))             { setGuestError("Already added."); return; }
    if (guestEmails.length >= 5)             { setGuestError("Maximum 5 guests."); return; }
    setGuestEmails(prev => [...prev, g]); setGuestInput(""); setGuestError("");
  }
  function validateForm(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim())          e.name  = "Name is required.";
    if (!emailRe.test(form.email))  e.email = "Enter a valid email address.";
    if (form.phone.trim()) {
      const d = form.phone.replace(/\D/g, "");
      if (d.length < 6 || d.length > 15) e.phone = "Enter a valid phone number (6 to 15 digits).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
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
          visitorTimezone: selectedTimezone,
          guestEmails:     guestEmails.length > 0 ? guestEmails : undefined,
          source:          "coaching-website",
        },
      });
      if (error || !data?.success) {
        const msg = data?.error || "Booking failed. Please try again.";
        if (msg.includes("just taken") || msg.includes("slot")) {
          const dateStr = format(selectedDate!, "yyyy-MM-dd");
          const { dayStartUTC, dayEndUTC } = getLocalDayRange(dateStr, selectedTimezone);
          supabase.functions.invoke("get-slots", { body: { dayStartUTC, dayEndUTC } }).then(({ data }) => setSlots(data?.slots ?? []));
          setSelectedSlot(null); setStep(2);
        }
        toast.error(msg); return;
      }
      setStep(4);
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(1); setSelectedDate(undefined); setSelectedSlot(null); setSlots([]);
    setForm({ name: "", email: "", company: "", notes: "", phone: "" });
    setErrors({}); setGuestEmails([]); setGuestInput("");
  }

  const slide = { enter: { opacity: 0, x: 40 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
  const { weekdays, saturday, tzAbbr } = formatBusinessHours(selectedTimezone);

  return (
    <div className="min-h-screen bg-navy text-white">
      <Helmet>
        <title>Book a Fit Call · Ahmad Shayan Coaching</title>
        <meta name="description" content="Book a free 15-minute fit call with Ahmad Shayan. Pick a date and time that works for you." />
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="pt-[120px] pb-10 px-[clamp(20px,4vw,48px)] text-center relative"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(50% 60% at 50% 40%, rgba(37,99,235,0.14), transparent 70%)" }} aria-hidden />
        <div className="relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.14em] uppercase text-blue px-3 py-1.5 rounded-full border border-blue/[0.28] bg-blue/[0.08]">
            15-min fit call
          </span>
          <h1 className="font-serif text-[clamp(32px,4.5vw,52px)] font-medium mt-4 mb-3.5">Book a call with Ahmad</h1>
          <p className="text-white/65 text-[17px] mb-8 max-w-[500px] mx-auto">No commitment. We will figure out if it is a fit and what to build first.</p>

          {/* Timezone picker */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-[13px] text-white/50">
              <Globe className="w-3.5 h-3.5" />
              Times shown in:
            </span>
            <div className="relative">
              {!timezoneVerified && (
                <span className="absolute -inset-1 rounded-full border border-blue/50 animate-pingRing pointer-events-none" />
              )}
              <select
                value={selectedTimezone}
                onFocus={() => setTimezoneVerified(true)}
                onChange={(e) => { setSelectedTimezone(e.target.value); setTimezoneVerified(true); setSelectedSlot(null); }}
                className="appearance-none bg-blue/[0.08] border border-blue/40 text-white px-3 pr-7 py-1.5 rounded-full text-[13px] font-medium outline-none focus:border-blue/80 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] max-w-[260px] cursor-pointer"
              >
                {!TIMEZONES.find(t => t.value === selectedTimezone) && (
                  <option value={selectedTimezone}>{selectedTimezone.replace(/_/g, " ")} (auto-detected)</option>
                )}
                {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          {!timezoneVerified && (
            <p className="text-[12px] text-amber/90 flex items-center gap-1.5 justify-center mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
              Please confirm your timezone before selecting a date
            </p>
          )}
        </div>
      </motion.div>

      {/* Step indicator + card */}
      <div className="max-w-[760px] mx-auto px-[clamp(20px,4vw,40px)] pb-20">
        {step < 4 && <StepIndicator step={step} />}

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-[clamp(24px,4vw,44px)] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">

            {/* Step 1: Date picker */}
            {step === 1 && (
              <motion.div key="s1" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="font-serif text-[clamp(20px,2vw,26px)] font-medium text-white mb-6">Choose a date</h2>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); if (d) setStep(2); }}
                    disabled={(d) => isBefore(d, minDate) || isAfter(d, maxDate)}
                    classNames={{ root: "!m-0" }}
                  />
                </div>
                <p className="text-center text-[13px] text-white/45 mt-4 flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue" />
                  Available Mon to Fri: {weekdays} {tzAbbr} &nbsp;·&nbsp; Sat: {saturday} {tzAbbr}
                </p>
              </motion.div>
            )}

            {/* Step 2: Time slots */}
            {step === 2 && (
              <motion.div key="s2" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="w-9 h-9 rounded-full border border-white/[0.12] grid place-items-center text-white/60 hover:border-white/30 hover:text-white transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="font-serif text-[clamp(20px,2vw,26px)] font-medium text-white">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Pick a time"}
                    </h2>
                    <p className="text-[13px] text-white/45">Select a 30-minute slot</p>
                  </div>
                </div>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-16 gap-3 text-white/50">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading available times...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-9 h-9 mx-auto mb-4 text-white/20" />
                    <p className="text-white/50 font-medium">No available slots on this day.</p>
                    <p className="text-sm text-white/30 mt-1">Please pick a different date.</p>
                    <button onClick={() => setStep(1)} className="mt-4 px-5 py-2.5 rounded-full border border-white/[0.15] text-white/70 text-sm hover:border-white/30 hover:text-white transition-all">
                      Choose another date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedSlot(slot); setStep(3); }}
                        className="border border-white/[0.10] rounded-[10px] px-4 py-3 text-sm font-medium text-white/80 hover:border-blue/50 hover:bg-blue/12 hover:text-white transition-all text-center hover:-translate-y-px"
                      >
                        {formatSlotTime(slot, selectedTimezone)}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Contact form */}
            {step === 3 && (
              <motion.div key="s3" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(2)} className="w-9 h-9 rounded-full border border-white/[0.12] grid place-items-center text-white/60 hover:border-white/30 hover:text-white transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="font-serif text-[clamp(20px,2vw,26px)] font-medium text-white">Your details</h2>
                    {selectedDate && selectedSlot && (
                      <p className="text-[13px] text-blue font-medium">
                        {format(selectedDate, "MMMM d, yyyy")} at {formatSlotTime(selectedSlot, selectedTimezone)}
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13.5px] font-semibold text-white/65">Full Name <span className="text-red-400">*</span></label>
                      <input
                        type="text" placeholder="Jane Smith" value={form.name} autoComplete="name"
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(er => ({ ...er, name: undefined })); }}
                        className={`w-full px-4 py-3 bg-white/[0.05] border rounded-[10px] text-white placeholder:text-white/28 outline-none transition-all ${errors.name ? "border-red-500/60" : "border-white/[0.10] focus:border-blue/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"}`}
                      />
                      {errors.name && <p className="text-red-400 text-[12px]">{errors.name}</p>}
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13.5px] font-semibold text-white/65">Email Address <span className="text-red-400">*</span></label>
                      <input
                        type="email" placeholder="you@company.com" value={form.email} autoComplete="email"
                        onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(er => ({ ...er, email: undefined })); }}
                        className={`w-full px-4 py-3 bg-white/[0.05] border rounded-[10px] text-white placeholder:text-white/28 outline-none transition-all ${errors.email ? "border-red-500/60" : "border-white/[0.10] focus:border-blue/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"}`}
                      />
                      {errors.email && <p className="text-red-400 text-[12px]">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13.5px] font-semibold text-white/65">Company / Organization <span className="text-white/30 font-normal text-xs ml-1">(optional)</span></label>
                    <input
                      type="text" placeholder="Acme Corp" value={form.company} autoComplete="organization"
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-[10px] text-white placeholder:text-white/28 outline-none focus:border-blue/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13.5px] font-semibold text-white/65 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue" />
                      WhatsApp / Phone <span className="text-white/30 font-normal text-xs ml-1">(optional)</span>
                    </label>
                    <p className="text-xs text-white/30 -mt-0.5">Share your number for a WhatsApp follow-up after the call.</p>
                    <input
                      type="tel" placeholder="+1 555 000 0000" value={form.phone} autoComplete="tel"
                      onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); if (errors.phone) setErrors(er => ({ ...er, phone: undefined })); }}
                      className={`w-full px-4 py-3 bg-white/[0.05] border rounded-[10px] text-white placeholder:text-white/28 outline-none transition-all ${errors.phone ? "border-red-500/60" : "border-white/[0.10] focus:border-blue/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"}`}
                    />
                    {errors.phone && <p className="text-red-400 text-[12px]">{errors.phone}</p>}
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13.5px] font-semibold text-white/65">What do you want to build?</label>
                    <textarea
                      rows={3} placeholder="Briefly describe what you are hoping to ship with Claude Code..."
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-[10px] text-white placeholder:text-white/28 outline-none focus:border-blue/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition-all resize-none"
                    />
                  </div>

                  {/* Guest invites */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13.5px] font-semibold text-white/65 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-blue" />
                      Invite others <span className="text-white/30 font-normal text-xs ml-1">(optional, max 5)</span>
                    </label>
                    <p className="text-xs text-white/30 -mt-0.5">They will get the same calendar invite and meeting link.</p>
                    <div className="flex gap-2.5">
                      <input
                        type="email" placeholder="colleague@company.com" value={guestInput}
                        onChange={e => { setGuestInput(e.target.value); setGuestError(""); }}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGuest(); } }}
                        disabled={guestEmails.length >= 5}
                        className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.10] rounded-[10px] text-white placeholder:text-white/28 outline-none focus:border-blue/60 transition-all disabled:opacity-40"
                      />
                      <button
                        type="button" onClick={addGuest} disabled={!guestInput.trim() || guestEmails.length >= 5}
                        className="px-4 py-3 rounded-[10px] border border-white/[0.12] text-sm font-medium text-white/70 hover:border-blue/50 hover:text-blue transition-all disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                    {guestError && <p className="text-red-400 text-[12px]">{guestError}</p>}
                    {guestEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {guestEmails.map(g => (
                          <span key={g} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue/[0.12] text-blue border border-blue/[0.2]">
                            {g}
                            <button type="button" onClick={() => setGuestEmails(prev => prev.filter(x => x !== g))} className="hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zoom note */}
                  <div className="flex items-start gap-3 p-3.5 bg-blue/[0.06] border border-blue/[0.18] rounded-[12px] text-sm text-white/60">
                    <Video className="w-4 h-4 text-blue mt-px flex-shrink-0" />
                    <span>A meeting link will be sent in your confirmation email. Free, no credit card, no commitment.</span>
                  </div>

                  <button
                    type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 py-[17px] rounded-full bg-blue text-white text-base font-semibold shadow-[0_8px_24px_-10px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 hover:bg-[#1d57db] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.75)] transition-all disabled:opacity-65 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {submitting ? (
                      <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Booking your call...</>
                    ) : (
                      <>Confirm Booking <ArrowRight className="w-[18px] h-[18px]" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green/[0.12] border-2 border-green/[0.35] flex items-center justify-center mx-auto mb-6"
                >
                  <ShieldCheck className="w-10 h-10 text-green" />
                </motion.div>
                <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-medium text-white mb-2.5">You are booked!</h2>
                <p className="text-white/60 text-base mb-2 max-w-[420px] mx-auto">
                  A confirmation has been sent to <strong className="text-white font-medium">{form.email}</strong>. Check your inbox for the meeting link.
                </p>
                {guestEmails.length > 0 && (
                  <p className="text-sm text-white/45 mb-7">Invites also sent to: <span className="text-white/65">{guestEmails.join(", ")}</span></p>
                )}

                {selectedDate && selectedSlot && (
                  <div className="inline-block bg-blue/[0.08] border border-blue/[0.22] rounded-[14px] px-6 py-4 mb-8 text-left">
                    <div className="flex items-center gap-2.5 text-blue font-semibold mb-1.5">
                      <CalendarDays className="w-4 h-4" />
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2.5 text-white/55 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSlotTime(selectedSlot, selectedTimezone)} &nbsp;·&nbsp; 15 min &nbsp;·&nbsp; {getTzLabel(selectedTimezone)}
                    </div>
                  </div>
                )}

                <p className="text-sm text-white/40 mb-7">Can not make it? Reply to the confirmation email to reschedule.</p>
                <button
                  onClick={reset}
                  className="px-7 py-3 rounded-full border border-white/[0.15] text-white/70 font-medium hover:border-white/30 hover:text-white transition-all"
                >
                  Book another call
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Trust badges */}
        {step < 4 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[13px] text-white/45"
          >
            {["Free, no credit card", "15 minutes", "Cancel anytime", "Instant confirmation"].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green" /> {b}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
