import React from "react";
import { Link } from "react-router-dom";

const MARQUEE_STYLE = `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}
`;

const STARS = (n) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#facc15" : "#334155", fontSize: 13 }}>★</span>
  ));

const PLATFORM_ICONS = {
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  telegram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  discord: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
    </svg>
  ),
  replit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 1.5A1.5 1.5 0 0 1 3.5 0h7A1.5 1.5 0 0 1 12 1.5v7A1.5 1.5 0 0 1 10.5 10h-7A1.5 1.5 0 0 1 2 8.5v-7zm9.5 9A1.5 1.5 0 0 1 13 12v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 19v-7a1.5 1.5 0 0 1 1.5-1.5h7zm2.5-9A1.5 1.5 0 0 1 15.5 0H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 10h-4.5A1.5 1.5 0 0 1 14 8.5v-7zm0 10.5A1.5 1.5 0 0 1 15.5 10H20a1.5 1.5 0 0 1 1.5 1.5V16A1.5 1.5 0 0 1 20 17.5h-4.5A1.5 1.5 0 0 1 14 16v-4.5z" />
    </svg>
  ),
  reddit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  ),
  producthunt: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.604 8.4h-3.405V12h3.405c.993 0 1.801-.808 1.801-1.8 0-.993-.808-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.8V6h5.804c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z" />
    </svg>
  ),
};

const AVATAR_COLORS = [
  ["#1e3a5f", "#38bdf8"], ["#1a2e1a", "#4ade80"], ["#3b1f1f", "#f87171"],
  ["#2d1f3b", "#c084fc"], ["#1f2d3b", "#60a5fa"], ["#3b2d1a", "#fb923c"],
  ["#1a3b2d", "#34d399"], ["#3b1a2d", "#f472b6"], ["#1f1f3b", "#818cf8"],
  ["#2d3b1a", "#a3e635"],
];

function Avatar({ name, index }) {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: bg, border: `2px solid ${fg}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: 14, fontWeight: 700, color: fg,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {initials}
    </div>
  );
}

const REVIEWS = [
  { name: "James K.", flag: "🇺🇸", stars: 5, platform: "twitter", text: "T/R Agency found 14 critical bugs in my app before launch. Saved my startup from a disaster. Worth every penny." },
  { name: "Sarah M.", flag: "🇬🇧", stars: 5, platform: "linkedin", text: "Finally passed Google Play's closed testing requirements thanks to their team. Fast, professional, reliable." },
  { name: "Emeka O.", flag: "🇳🇬", stars: 5, platform: "discord", text: "The QA Insights package was eye-opening. I had no idea how much friction my onboarding flow had until their report." },
  { name: "Charlotte B.", flag: "🇬🇧", stars: 5, platform: "producthunt", text: "Submitted for testing on Monday, had a full bug report by Wednesday. The team is incredibly responsive." },
  { name: "Lucas R.", flag: "🇧🇷", stars: 4, platform: "reddit", text: "Solid testing service. Their UX friction analysis helped us increase our day-1 retention significantly." },
  { name: "Adaeze N.", flag: "🇳🇬", stars: 5, platform: "telegram", text: "Our app was stuck in Google Play testing for weeks. T/R Agency solved it in 3 days. Unreal." },
  { name: "David H.", flag: "🇺🇸", stars: 5, platform: "replit", text: "The Launch Assurance package is comprehensive. 30 real testers caught issues our internal team completely missed." },
  { name: "Aisha F.", flag: "🇦🇪", stars: 5, platform: "twitter", text: "Professional, fast, and thorough. The compatibility testing across devices was exactly what we needed pre-launch." },
  { name: "Oliver T.", flag: "🇬🇧", stars: 5, platform: "linkedin", text: "I was skeptical at first but the detailed QA report changed my mind. Launched with full confidence." },
  { name: "Emily C.", flag: "🇺🇸", stars: 4, platform: "discord", text: "Great communication throughout the process. My app performed flawlessly on launch day." },
  { name: "Chukwuemeka A.", flag: "🇳🇬", stars: 5, platform: "producthunt", text: "These guys really understand what indie developers go through. Affordable, effective, and fast." },
  { name: "Raj P.", flag: "🇮🇳", stars: 5, platform: "reddit", text: "The regression testing package caught a critical issue after our last update. Saved us from a 1-star wave." },
  { name: "Jessica W.", flag: "🇺🇸", stars: 5, platform: "twitter", text: "T/R Agency helped us ship our iOS app with zero crashes at launch. Their testers are the real deal." },
  { name: "Harry L.", flag: "🇬🇧", stars: 5, platform: "telegram", text: "I recommend them to every founder I know. Their process is tight and the results speak for themselves." },
  { name: "Ngozi E.", flag: "🇳🇬", stars: 4, platform: "replit", text: "The Bug Discovery Report was thorough and actionable. Fixed everything before going live." },
  { name: "Pierre D.", flag: "🇫🇷", stars: 5, platform: "linkedin", text: "Exceptional service. The launch consultation call alone was worth the price of the package." },
  { name: "Tyler S.", flag: "🇺🇸", stars: 5, platform: "discord", text: "Shipped my SaaS to 500+ users with zero critical bugs. T/R Agency made that possible." },
  { name: "Zara M.", flag: "🇨🇦", stars: 5, platform: "producthunt", text: "The 14-day testing cycle was perfect. Real feedback from real users — not automated bots." },
  { name: "Michael B.", flag: "🇺🇸", stars: 5, platform: "twitter", text: "We had a major release coming up and they delivered a complete QA report in under 48 hours. Insane turnaround." },
  { name: "Sophie R.", flag: "🇬🇧", stars: 5, platform: "reddit", text: "Fantastic experience. The device compatibility testing found issues on older Android versions we'd never have caught." },
  { name: "Ifeanyi C.", flag: "🇳🇬", stars: 5, platform: "telegram", text: "They helped us meet every Google Play requirement. No more rejected builds." },
  { name: "Megan A.", flag: "🇺🇸", stars: 4, platform: "replit", text: "Clean, well-structured reports. Easy to hand off directly to our dev team for fixes." },
  { name: "Liam O.", flag: "🇬🇧", stars: 5, platform: "linkedin", text: "Worth every cent. The UX friction analysis alone improved our conversion rate by 22%." },
  { name: "Fatima B.", flag: "🇿🇦", stars: 5, platform: "twitter", text: "Our users noticed the difference immediately. App was smoother, faster, more polished at launch." },
  { name: "Chris N.", flag: "🇺🇸", stars: 5, platform: "discord", text: "T/R Agency found an auth bug that would have locked users out on day one. They literally saved the launch." },
  { name: "Emma G.", flag: "🇬🇧", stars: 5, platform: "producthunt", text: "Every startup should use this before launch. The confidence you get from a real QA pass is invaluable." },
  { name: "Tunde A.", flag: "🇳🇬", stars: 4, platform: "reddit", text: "Solid team. Professional communication and a report that was actually readable and useful." },
  { name: "Amanda T.", flag: "🇺🇸", stars: 5, platform: "telegram", text: "Passed TestFlight review on first submission. T/R Agency's testing process is thorough and efficient." },
  { name: "Jack P.", flag: "🇬🇧", stars: 5, platform: "replit", text: "We cut our post-launch support tickets by 60% after running through their QA process. Highly recommended." },
  { name: "Chioma I.", flag: "🇳🇬", stars: 5, platform: "linkedin", text: "The Launch Readiness Report gave us a clear go/no-go decision. That clarity is priceless before a public launch." },
  { name: "William F.", flag: "🇬🇧", stars: 5, platform: "twitter", text: "I've worked with testing agencies before but T/R is in a different league. Faster and more thorough." },
  { name: "Kelechi U.", flag: "🇳🇬", stars: 5, platform: "discord", text: "Helped my app get unstuck from a Google Play review loop in less than a week. Brilliant." },
  { name: "Grace H.", flag: "🇬🇧", stars: 4, platform: "producthunt", text: "The QA Insights package is perfect for lean teams. Lots of value packed into a single report." },
  { name: "Blessing O.", flag: "🇳🇬", stars: 5, platform: "reddit", text: "Straightforward, honest feedback about our app. No fluff — just actionable findings." },
  { name: "Alice S.", flag: "🇬🇧", stars: 5, platform: "telegram", text: "Our iOS launch went perfectly. T/R Agency's testers stress-tested every flow and we shipped with full confidence." },
  { name: "Amaka C.", flag: "🇳🇬", stars: 5, platform: "replit", text: "Real users, real feedback, real results. Our onboarding completion rate jumped after their UX analysis." },
  { name: "Marcus V.", flag: "🇺🇸", stars: 5, platform: "linkedin", text: "The retesting after fixes feature is gold. They didn't just find bugs — they confirmed they were fixed too." },
  { name: "Isabella K.", flag: "🇦🇺", stars: 5, platform: "twitter", text: "T/R Agency is the QA partner I wish I'd found sooner. Saved us weeks of guesswork before launch." },
  { name: "Noah J.", flag: "🇺🇸", stars: 4, platform: "discord", text: "Detailed, professional, and fast. Their report format is easy to understand even for non-technical founders." },
  { name: "Chloe R.", flag: "🇨🇦", stars: 5, platform: "producthunt", text: "We launched on Product Hunt with zero issues thanks to T/R Agency's testing. Top 5 product of the day." },
  { name: "Daniel M.", flag: "🇺🇸", stars: 5, platform: "reddit", text: "The launch consultation call gave us the confidence to press go. Best $179 we ever spent." },
  { name: "Priya S.", flag: "🇮🇳", stars: 5, platform: "telegram", text: "Flawless process from intake to delivery. The team is attentive and the testing is genuinely thorough." },
];

function ReviewCard({ review, index }) {
  return (
    <div style={{
      background: "#0f1525",
      border: "1px solid rgba(56,189,248,0.12)",
      borderRadius: 14,
      padding: "18px 20px",
      width: 300,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={review.name} index={index} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#e6edf7" }}>
            {review.name} <span style={{ fontSize: 15 }}>{review.flag}</span>
          </div>
          <div style={{ display: "flex", gap: 1, marginTop: 2 }}>
            {STARS(review.stars)}
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          color: "#5c6781",
          opacity: 0.7,
        }}>
          {PLATFORM_ICONS[review.platform]}
        </div>
      </div>
      <p style={{
        margin: 0, fontSize: 13, color: "#8b97ad",
        lineHeight: 1.6,
      }}>
        "{review.text}"
      </p>
    </div>
  );
}

function MarqueeRow({ reviews, direction = "left", speed = 40 }) {
  const doubled = [...reviews, ...reviews];
  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div style={{
        display: "flex",
        gap: 16,
        width: "max-content",
        animation: `${direction === "left" ? "marquee-left" : "marquee-right"} ${speed}s linear infinite`,
      }}>
        {doubled.map((r, i) => (
          <ReviewCard key={i} review={r} index={i} />
        ))}
      </div>
    </div>
  );
}

const HOW_STEPS = [
  {
    n: "01",
    title: "Submit Intake",
    desc: "Fill out our quick intake form. Tell us about your app, platform, and what you need tested. Takes less than 3 minutes.",
  },
  {
    n: "02",
    title: "Get Analyzed",
    desc: "Our QA team reviews your submission, assigns real testers, and begins structured testing within 24 hours.",
  },
  {
    n: "03",
    title: "Delivery",
    desc: "Receive a detailed report with findings, bug documentation, UX feedback, and a launch readiness verdict.",
  },
];

const SERVICE_CARDS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "App Rescue",
    desc: "Emergency fixes for broken or underperforming apps — fast.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: "QA Testing",
    desc: "Real human testers uncovering bugs before your users do.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Technical Audit",
    desc: "Deep-dive analysis of code quality, security, and architecture.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Performance Upgrade",
    desc: "Speed, stability, and conversion improvements in one sprint.",
  },
];

export default function Home() {
  const row1 = REVIEWS.slice(0, Math.ceil(REVIEWS.length / 2));
  const row2 = REVIEWS.slice(Math.ceil(REVIEWS.length / 2));

  return (
    <>
      <style>{MARQUEE_STYLE}</style>

      {/* ── SECTION 1: HERO ── */}
      <section style={{
        minHeight: "100vh",
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
      }}>
        {/* Noise / gradient texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.18), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(212,175,106,0.10), transparent 55%)
          `,
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 75%)",
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 860, width: "100%", textAlign: "center",
          animation: "hero-fade-up 0.8s ease both",
        }}>
          {/* Trust badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999,
            border: "1px solid rgba(56,189,248,0.28)",
            background: "rgba(56,189,248,0.08)",
            color: "#38bdf8", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 32,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 10px #38bdf8",
              animation: "scroll-bounce 2s infinite",
              display: "inline-block",
            }} />
            Elite Mobile QA & Launch Testing
          </div>

          <h1 style={{
            fontSize: "clamp(38px, 7vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            margin: "0 0 24px",
            color: "#f1f5f9",
          }}>
            Your App. Fixed.<br />
            <span style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #d4af6a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>
              Fast. Guaranteed.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            color: "#8b97ad",
            margin: "0 auto 40px",
            maxWidth: 580,
            lineHeight: 1.65,
          }}>
            Elite app rescue, QA testing and software engineering for global startups.
          </p>

          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 16,
          }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/intake" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "15px 28px", borderRadius: 12,
                background: "#38bdf8", color: "#061018",
                fontWeight: 700, fontSize: 15, textDecoration: "none",
                boxShadow: "0 12px 32px -8px rgba(56,189,248,0.55)",
                transition: "all .2s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 18px 40px -8px rgba(56,189,248,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 12px 32px -8px rgba(56,189,248,0.55)"; }}
              >
                Get Started — Free Consult
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <Link to="/login" style={{
              color: "#5c6781", fontSize: 13, textDecoration: "none",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#38bdf8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#5c6781"; }}
            >
              Already a client? Sign in
            </Link>
          </div>

          {/* Trust bar */}
          <p style={{
            marginTop: 40, fontSize: 13, color: "#5c6781",
            letterSpacing: "0.04em",
          }}>
            Trusted by founders across 🇺🇸 🇬🇧 🇳🇬
          </p>
        </div>

        {/* Scroll arrow */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          color: "#334155",
          animation: "scroll-bounce 2s ease-in-out infinite",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── SECTION 2: WHAT WE DO ── */}
      <section style={{
        padding: "96px 24px",
        background: "#0b0f19",
        borderTop: "1px solid rgba(56,189,248,0.1)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              color: "#38bdf8", textTransform: "uppercase",
              letterSpacing: "0.2em", marginBottom: 14,
            }}>// What We Do</div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
              letterSpacing: "-0.02em", margin: "0 0 14px", color: "#e6edf7",
            }}>
              Built for Founders Who Ship
            </h2>
            <p style={{ color: "#8b97ad", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
              End-to-end quality assurance so your app launches clean and stays that way.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 20,
          }}>
            {SERVICE_CARDS.map((card, i) => (
              <div key={i} style={{
                background: "#0f1525",
                border: "1px solid rgba(56,189,248,0.12)",
                borderRadius: 16,
                padding: "28px 26px",
                transition: "all .25s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.32)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px -20px rgba(0,0,0,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.12)";
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#38bdf8", marginBottom: 18,
                }}>
                  {card.icon}
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#e6edf7" }}>
                  {card.title}
                </h3>
                <p style={{ margin: 0, color: "#8b97ad", fontSize: 14, lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SOCIAL PROOF NUMBERS ── */}
      <section style={{
        padding: "80px 24px",
        background: "#0f1525",
        borderTop: "1px solid rgba(56,189,248,0.1)",
        borderBottom: "1px solid rgba(56,189,248,0.1)",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 1,
          background: "rgba(56,189,248,0.1)",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(56,189,248,0.12)",
        }}>
          {[
            { num: "40+", label: "Happy Clients" },
            { num: "98%", label: "Satisfaction Rate" },
            { num: "< 48hrs", label: "First Response" },
            { num: "3", label: "Continents" },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "36px 24px", background: "#0f1525",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 800, color: "#38bdf8",
                letterSpacing: "-0.03em", marginBottom: 8,
              }}>
                {item.num}
              </div>
              <div style={{ fontSize: 13, color: "#5c6781", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: REVIEWS MARQUEE ── */}
      <section style={{
        padding: "96px 0",
        background: "#0b0f19",
        borderTop: "1px solid rgba(56,189,248,0.08)",
        overflow: "hidden",
      }}>
        <div style={{ textAlign: "center", marginBottom: 52, padding: "0 24px" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: "#38bdf8", textTransform: "uppercase",
            letterSpacing: "0.2em", marginBottom: 14,
          }}>// Client Reviews</div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
            letterSpacing: "-0.02em", margin: "0 0 14px", color: "#e6edf7",
          }}>
            What Founders Are Saying
          </h2>
          <p style={{ color: "#8b97ad", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
            40+ founders trust T/R Agency to ship with confidence.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MarqueeRow reviews={row1} direction="left" speed={50} />
          <MarqueeRow reviews={row2} direction="right" speed={55} />
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section style={{
        padding: "96px 24px",
        background: "#0f1525",
        borderTop: "1px solid rgba(56,189,248,0.1)",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              color: "#38bdf8", textTransform: "uppercase",
              letterSpacing: "0.2em", marginBottom: 14,
            }}>// How It Works</div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
              letterSpacing: "-0.02em", margin: 0, color: "#e6edf7",
            }}>
              Three Steps to Launch Ready
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 0,
            position: "relative",
          }}>
            {HOW_STEPS.map((step, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", padding: "32px 28px",
                position: "relative",
              }}>
                {i < HOW_STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", top: 48, right: 0,
                    width: "50%", height: 1,
                    background: "linear-gradient(90deg, rgba(56,189,248,0.4), transparent)",
                    display: "none",
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "rgba(56,189,248,0.1)",
                  border: "1px solid rgba(56,189,248,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16, fontWeight: 800, color: "#38bdf8",
                  marginBottom: 20,
                }}>
                  {step.n}
                </div>
                <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: "#e6edf7" }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, color: "#8b97ad", fontSize: 14, lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Connecting line below */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 0,
            marginTop: 8, padding: "0 14%",
          }}>
            <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, transparent, #38bdf8, transparent)", borderRadius: 2, opacity: 0.3 }} />
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FINAL CTA ── */}
      <section style={{
        padding: "100px 24px",
        background: "#050505",
        borderTop: "1px solid rgba(56,189,248,0.1)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.12), transparent 60%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900,
            letterSpacing: "-0.03em", margin: "0 0 18px",
            color: "#f1f5f9", lineHeight: 1.1,
          }}>
            Ready to rescue your app?
          </h2>
          <p style={{ color: "#8b97ad", fontSize: 17, margin: "0 0 40px", lineHeight: 1.6 }}>
            Tell us about your project and we'll map out the right QA path — no commitment required.
          </p>
          <Link to="/intake" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "17px 34px", borderRadius: 14,
            background: "#38bdf8", color: "#061018",
            fontWeight: 800, fontSize: 16, textDecoration: "none",
            boxShadow: "0 14px 36px -8px rgba(56,189,248,0.6)",
            transition: "all .2s",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 20px 44px -8px rgba(56,189,248,0.75)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 14px 36px -8px rgba(56,189,248,0.6)"; }}
          >
            Start Now — It's Free to Consult
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <div style={{
            marginTop: 24, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
            color: "#5c6781", fontSize: 13,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure · Private · No commitment
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FOOTER ── */}
      <footer style={{
        background: "#050505",
        borderTop: "1px solid rgba(56,189,248,0.1)",
        padding: "48px 24px 40px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 40,
            marginBottom: 40,
          }}>
            {/* Logo + tagline */}
            <div>
              <Link to="/" style={{
                display: "flex", alignItems: "center", gap: 10,
                textDecoration: "none", marginBottom: 12,
              }}>
                <div style={{
                  background: "#ffffff", borderRadius: 10,
                  padding: "4px 7px", height: 42,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4)",
                }}>
                  <img src="/logo.png" alt="T/R Agency" style={{ height: 32, width: "auto", display: "block" }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#e6edf7" }}>
                  T<span style={{ color: "#38bdf8" }}>/</span>R Agency
                </span>
              </Link>
              <p style={{ margin: 0, color: "#5c6781", fontSize: 13, maxWidth: 240, lineHeight: 1.6 }}>
                Mobile App Testing, QA Validation, and Launch Readiness for global startups.
              </p>
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#5c6781",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14,
                }}>Company</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "About", to: "/about" },
                    { label: "Services", to: "/services" },
                    { label: "Reviews", to: "/#reviews" },
                    { label: "Portal", to: "/portal" },
                  ].map((l) => (
                    <Link key={l.label} to={l.to} style={{
                      color: "#8b97ad", fontSize: 14, textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#e6edf7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#8b97ad"; }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#5c6781",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14,
                }}>Support</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href="mailto:tragency.ops@proton.me" style={{
                    color: "#8b97ad", fontSize: 14, textDecoration: "none",
                    transition: "color .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#38bdf8"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#8b97ad"; }}
                  >
                    tragency.ops@proton.me
                  </a>
                  <Link to="/intake" style={{
                    color: "#8b97ad", fontSize: 14, textDecoration: "none",
                    transition: "color .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#e6edf7"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#8b97ad"; }}
                  >
                    Start a Consult
                  </Link>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#5c6781",
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14,
              }}>Social</div>
              <div style={{ display: "flex", gap: 10 }}>
                {/* X / Twitter */}
                <a href="https://x.com/tragnecyops" target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(56,189,248,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8b97ad", textDecoration: "none",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; e.currentTarget.style.color = "#38bdf8"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b97ad"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.15)"; }}
                  title="@tragnecyops on X"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(56,189,248,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8b97ad", textDecoration: "none",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; e.currentTarget.style.color = "#38bdf8"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b97ad"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.15)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* Telegram */}
                <a href="https://t.me" target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(56,189,248,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8b97ad", textDecoration: "none",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; e.currentTarget.style.color = "#38bdf8"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8b97ad"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.15)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid rgba(56,189,248,0.08)",
            paddingTop: 24,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ color: "#5c6781", fontSize: 13 }}>
              © {new Date().getFullYear()} T/R Agency. All rights reserved.
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: "#334155",
              letterSpacing: "0.1em",
            }}>
              MOBILE QA · LAUNCH TESTING · APP RESCUE
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
