# Ahmasoft Claude Code Coaching

Landing page for Ahmad Shayan's $250 Builder Sprint coaching offer at **coaching.ahmasoft.com**.

Single-file HTML site — no build step, no dependencies, instant deploy.

---

## What this is

A public-facing landing page for the Claude Code coaching practice. It covers the offer ($250 Builder Sprint), who it is for, how the Sprint works, testimonials, and a fit-call booking CTA.

Live at: **coaching.ahmasoft.com** (configure the domain in Vercel after deploy)

---

## Before going live — two things to update

### 1. Calendly booking URL

Every CTA button links to the placeholder `CALENDLY_BOOKING_URL`. Replace it with your real Calendly link before launch:

```bash
# find and replace in index.html:
# CALENDLY_BOOKING_URL → https://calendly.com/your-link-here
```

Or open `index.html` in any text editor and do a find-all-replace.

### 2. Headshot

The About section uses `assets/ahmad-shayan.jpg`. Replace it with your preferred photo at any time — same filename, same folder.

---

## Deploy

This site is already connected to Vercel. To push updates:

```bash
# from this directory:
git add .
git commit -m "your message"
git push origin main
# Vercel auto-deploys on push
```

To manually redeploy:

```bash
vercel --prod
```

---

## Custom domain

1. Go to Vercel dashboard → this project → Settings → Domains
2. Add `coaching.ahmasoft.com`
3. In your DNS provider: add a `CNAME` record pointing `coaching` at Vercel's DNS target (Vercel shows the exact value)
4. Vercel auto-provisions SSL

---

## Structure

```
ahmasoft-coaching/
├── index.html          ← full site (HTML + CSS + JS, self-contained)
├── assets/
│   ├── ahmasoft-icon.png   ← logo in nav
│   └── ahmad-shayan.jpg    ← headshot in About section
└── README.md
```

---

## Local preview

Open `index.html` directly in a browser. No server needed.

---

Built with Claude Design · May 2026 · Ahmasoft
