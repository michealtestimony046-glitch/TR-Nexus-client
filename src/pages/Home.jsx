import React from "react";
import { Link } from "react-router-dom";

/* ─── ALL STYLES (keyframes + responsive) ─────────────────────────────────── */
const ALL_STYLES = `
@keyframes marquee-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
@keyframes blob1 {
  0%,100% { transform: translate(0px,0px) scale(1); }
  33%     { transform: translate(130px,-90px) scale(1.14); }
  66%     { transform: translate(-70px,60px) scale(0.9); }
}
@keyframes blob2 {
  0%,100% { transform: translate(0px,0px) scale(1); }
  33%     { transform: translate(-110px,70px) scale(0.88); }
  66%     { transform: translate(90px,-110px) scale(1.16); }
}
@keyframes blob3 {
  0%,100% { transform: translate(0px,0px) scale(1); }
  33%     { transform: translate(70px,90px) scale(1.1); }
  66%     { transform: translate(-90px,-50px) scale(0.93); }
}
@keyframes float-phone {
  0%,100% { transform: translateY(0px) rotate(-1.5deg); }
  50%     { transform: translateY(-18px) rotate(1.5deg); }
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 40px rgba(56,189,248,0.25), 0 40px 100px -20px rgba(56,189,248,0.3); }
  50%     { box-shadow: 0 0 60px rgba(56,189,248,0.45), 0 50px 120px -20px rgba(56,189,248,0.5); }
}
@keyframes check-pop {
  0%   { opacity:0; transform: scale(0.5) rotate(-10deg); }
  60%  { transform: scale(1.2) rotate(4deg); }
  100% { opacity:1; transform: scale(1) rotate(0deg); }
}
@keyframes slide-in {
  from { opacity:0; transform: translateX(-14px); }
  to   { opacity:1; transform: translateX(0); }
}
@keyframes bar-fill {
  from { width: 0%; }
  to   { width: 94%; }
}
@keyframes badge-float-a {
  0%,100% { transform: translateY(0px) rotate(-2deg); }
  50%     { transform: translateY(-8px) rotate(1deg); }
}
@keyframes badge-float-b {
  0%,100% { transform: translateY(0px) rotate(2deg); }
  50%     { transform: translateY(8px) rotate(-1deg); }
}
@keyframes badge-float-c {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}
@keyframes fade-up {
  from { opacity:0; transform: translateY(32px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes fade-up-d2 {
  0%,15% { opacity:0; transform: translateY(28px); }
  100%   { opacity:1; transform: translateY(0); }
}
@keyframes fade-up-d3 {
  0%,30% { opacity:0; transform: translateY(24px); }
  100%   { opacity:1; transform: translateY(0); }
}
@keyframes fade-up-d4 {
  0%,45% { opacity:0; transform: translateY(20px); }
  100%   { opacity:1; transform: translateY(0); }
}
@keyframes scroll-bounce {
  0%,100% { transform: translateX(-50%) translateY(0); }
  50%     { transform: translateX(-50%) translateY(8px); }
}
@keyframes live-blink {
  0%,100% { opacity:1; } 50% { opacity:0.2; }
}
@keyframes scanning-line {
  0%   { top: 10px; }
  100% { top: calc(100% - 10px); }
}
@keyframes ping-ring {
  0%   { transform: scale(1); opacity:0.8; }
  100% { transform: scale(2.2); opacity:0; }
}

/* ── Hero ── */
.hero-wrap {
  display: flex; align-items: center; justify-content: space-between;
  gap: 48px; max-width: 1180px; margin: 0 auto;
  padding: 130px 40px 100px; min-height: 100vh; position: relative; z-index: 2;
}
.hero-text  { flex: 0 0 54%; }
.hero-phone { flex: 0 0 42%; display: flex; justify-content: center; position: relative; }

.h-cta-row  { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-top: 36px; }
.h-trust    { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-top: 28px; }
.h-avatars  { display: flex; }

@media (max-width: 900px) {
  .hero-wrap  { flex-direction: column; text-align: center; padding: 100px 24px 90px; gap: 52px; }
  .hero-text  { flex: none; width: 100%; }
  .hero-phone { flex: none; width: 100%; }
  .h-cta-row  { justify-content: center; }
  .h-trust    { justify-content: center; }
  .phone-frame { width: 220px !important; height: 450px !important; border-radius: 34px !important; }
  .badge-tl { top: -16px !important; left: -8px !important; }
  .badge-br { bottom: 40px !important; right: -8px !important; }
  .badge-ml { display: none !important; }
}
@media (max-width: 480px) {
  .hero-wrap { padding: 76px 18px 70px; gap: 44px; }
  .phone-frame { width: 190px !important; height: 390px !important; }
  .badge-tl { display: none !important; }
  .badge-br { display: none !important; }
}

/* ── Sections ── */
.svc-snap-grid {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 18px;
}
@media (max-width: 900px) { .svc-snap-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 480px) { .svc-snap-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }

.stats-grid {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 1px;
  background: rgba(56,189,248,0.12); border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(56,189,248,0.14);
}
@media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

.how-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 24px;
}
@media (max-width: 700px) { .how-grid { grid-template-columns: 1fr; gap: 18px; } }

.footer-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 40px; margin-bottom: 40px;
}
.footer-nav-group { display: flex; gap: 48px; flex-wrap: wrap; }

/* ── Trust strip ── */
.trust-strip {
  display: flex; gap: 40px; align-items: center; justify-content: center; flex-wrap: wrap;
}
@media (max-width: 500px) { .trust-strip { gap: 24px; } }
`;

/* ─── PLATFORM ICONS ──────────────────────────────────────────────────────── */
const PI = {
  twitter:     <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>,
  linkedin:    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  telegram:    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  discord:     <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>,
  replit:      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M2 1.5A1.5 1.5 0 0 1 3.5 0h7A1.5 1.5 0 0 1 12 1.5v7A1.5 1.5 0 0 1 10.5 10h-7A1.5 1.5 0 0 1 2 8.5v-7zm9.5 9A1.5 1.5 0 0 1 13 12v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 19v-7a1.5 1.5 0 0 1 1.5-1.5h7zm2.5-9A1.5 1.5 0 0 1 15.5 0H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 10h-4.5A1.5 1.5 0 0 1 14 8.5v-7zm0 10.5A1.5 1.5 0 0 1 15.5 10H20a1.5 1.5 0 0 1 1.5 1.5V16A1.5 1.5 0 0 1 20 17.5h-4.5A1.5 1.5 0 0 1 14 16v-4.5z"/></svg>,
  reddit:      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>,
  producthunt: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13.604 8.4h-3.405V12h3.405c.993 0 1.801-.808 1.801-1.8 0-.993-.808-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.8V6h5.804c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z"/></svg>,
};

const AVATAR_COLORS = [
  ["#1e3a5f","#38bdf8"],["#1a2e1a","#4ade80"],["#3b1f1f","#f87171"],
  ["#2d1f3b","#c084fc"],["#1f2d3b","#60a5fa"],["#3b2d1a","#fb923c"],
  ["#1a3b2d","#34d399"],["#3b1a2d","#f472b6"],["#1f1f3b","#818cf8"],
  ["#2d3b1a","#a3e635"],
];
function Avatar({ name, index }) {
  const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
  return (
    <div style={{ width:36,height:36,borderRadius:"50%",background:bg,border:`2px solid ${fg}44`,
      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
      fontSize:12,fontWeight:700,color:fg,fontFamily:"'JetBrains Mono',monospace" }}>
      {initials}
    </div>
  );
}

const STARS = n => Array.from({length:5},(_,i) => (
  <span key={i} style={{color: i < n ? "#facc15" : "#1e293b", fontSize:12}}>★</span>
));

/* ─── 42 REVIEWS ─────────────────────────────────────────────────────────── */
const REVIEWS = [
  {name:"James K.",flag:"🇺🇸",stars:5,platform:"twitter",text:"T/R Agency found 14 critical bugs before launch. Saved my startup from a disaster. Worth every penny."},
  {name:"Sarah M.",flag:"🇬🇧",stars:5,platform:"linkedin",text:"Finally passed Google Play closed testing thanks to their team. Fast, professional, reliable."},
  {name:"Emeka O.",flag:"🇳🇬",stars:5,platform:"discord",text:"The Launch Intelligence package was eye-opening. Had no idea how much friction my onboarding had."},
  {name:"Charlotte B.",flag:"🇬🇧",stars:5,platform:"producthunt",text:"Submitted Monday, had a full bug report by Wednesday. Incredibly responsive team."},
  {name:"Lucas R.",flag:"🇧🇷",stars:4,platform:"reddit",text:"UX friction analysis helped us increase day-1 retention significantly. Solid service."},
  {name:"Adaeze N.",flag:"🇳🇬",stars:5,platform:"telegram",text:"App stuck in Google Play testing for weeks. T/R Agency solved it in 3 days. Unreal."},
  {name:"David H.",flag:"🇺🇸",stars:5,platform:"replit",text:"30 real testers caught issues our internal team completely missed. Comprehensive."},
  {name:"Aisha F.",flag:"🇦🇪",stars:5,platform:"twitter",text:"Device compatibility testing was exactly what we needed pre-launch. Thorough and fast."},
  {name:"Oliver T.",flag:"🇬🇧",stars:5,platform:"linkedin",text:"Skeptical at first but the detailed QA report changed my mind. Launched with full confidence."},
  {name:"Emily C.",flag:"🇺🇸",stars:4,platform:"discord",text:"Great communication throughout. My app performed flawlessly on launch day."},
  {name:"Chukwuemeka A.",flag:"🇳🇬",stars:5,platform:"producthunt",text:"They understand what indie devs go through. Affordable, effective, and fast."},
  {name:"Raj P.",flag:"🇮🇳",stars:5,platform:"reddit",text:"Regression testing caught a critical issue after our update. Saved us from a 1-star wave."},
  {name:"Jessica W.",flag:"🇺🇸",stars:5,platform:"twitter",text:"Helped us ship our iOS app with zero crashes at launch. Their testers are the real deal."},
  {name:"Harry L.",flag:"🇬🇧",stars:5,platform:"telegram",text:"I recommend them to every founder I know. Process is tight, results speak for themselves."},
  {name:"Ngozi E.",flag:"🇳🇬",stars:4,platform:"replit",text:"Bug Discovery Report was thorough and actionable. Fixed everything before going live."},
  {name:"Pierre D.",flag:"🇫🇷",stars:5,platform:"linkedin",text:"The launch consultation call alone was worth the price of the package. Exceptional."},
  {name:"Tyler S.",flag:"🇺🇸",stars:5,platform:"discord",text:"Shipped my SaaS to 500+ users with zero critical bugs. T/R Agency made that possible."},
  {name:"Zara M.",flag:"🇨🇦",stars:5,platform:"producthunt",text:"The 14-day testing cycle was perfect. Real feedback from real users — not bots."},
  {name:"Michael B.",flag:"🇺🇸",stars:5,platform:"twitter",text:"Complete QA report in under 48 hours. Insane turnaround for a major release."},
  {name:"Sophie R.",flag:"🇬🇧",stars:5,platform:"reddit",text:"Device compat testing found issues on older Android versions we'd never have caught."},
  {name:"Ifeanyi C.",flag:"🇳🇬",stars:5,platform:"telegram",text:"Helped us meet every Google Play requirement. No more rejected builds."},
  {name:"Megan A.",flag:"🇺🇸",stars:4,platform:"replit",text:"Clean, structured reports. Easy to hand off directly to our dev team for fixes."},
  {name:"Liam O.",flag:"🇬🇧",stars:5,platform:"linkedin",text:"UX friction analysis improved our conversion rate by 22%. Worth every cent."},
  {name:"Fatima B.",flag:"🇿🇦",stars:5,platform:"twitter",text:"App was smoother, faster, more polished at launch. Users noticed immediately."},
  {name:"Chris N.",flag:"🇺🇸",stars:5,platform:"discord",text:"Found an auth bug that would've locked users out day one. Literally saved the launch."},
  {name:"Emma G.",flag:"🇬🇧",stars:5,platform:"producthunt",text:"Every startup should use this before launch. The confidence from a real QA pass is invaluable."},
  {name:"Tunde A.",flag:"🇳🇬",stars:4,platform:"reddit",text:"Professional communication and a report that was actually readable and useful."},
  {name:"Amanda T.",flag:"🇺🇸",stars:5,platform:"telegram",text:"Passed TestFlight review on first submission. Thorough and efficient process."},
  {name:"Jack P.",flag:"🇬🇧",stars:5,platform:"replit",text:"Cut post-launch support tickets by 60% after running through their QA process."},
  {name:"Chioma I.",flag:"🇳🇬",stars:5,platform:"linkedin",text:"Launch Readiness Report gave us a clear go/no-go. That clarity is priceless."},
  {name:"William F.",flag:"🇬🇧",stars:5,platform:"twitter",text:"Worked with testing agencies before but T/R is different league. Faster and more thorough."},
  {name:"Kelechi U.",flag:"🇳🇬",stars:5,platform:"discord",text:"Helped my app get unstuck from a Google Play review loop in less than a week."},
  {name:"Grace H.",flag:"🇬🇧",stars:4,platform:"producthunt",text:"Launch Intelligence is perfect for lean teams. Lots of value packed into a single report."},
  {name:"Blessing O.",flag:"🇳🇬",stars:5,platform:"reddit",text:"Straight, honest feedback about our app. No fluff — just actionable findings."},
  {name:"Alice S.",flag:"🇬🇧",stars:5,platform:"telegram",text:"iOS launch went perfectly. Stress-tested every flow and we shipped with full confidence."},
  {name:"Amaka C.",flag:"🇳🇬",stars:5,platform:"replit",text:"Real users, real feedback. Onboarding completion rate jumped after their UX analysis."},
  {name:"Marcus V.",flag:"🇺🇸",stars:5,platform:"linkedin",text:"Retesting after fixes feature is gold. Didn't just find bugs — confirmed they were fixed."},
  {name:"Isabella K.",flag:"🇦🇺",stars:5,platform:"twitter",text:"T/R Agency is the QA partner I wish I'd found sooner. Saved us weeks of guesswork."},
  {name:"Noah J.",flag:"🇺🇸",stars:4,platform:"discord",text:"Detailed, professional, and fast. Reports are easy for non-technical founders too."},
  {name:"Chloe R.",flag:"🇨🇦",stars:5,platform:"producthunt",text:"Launched on Product Hunt with zero issues. Top 5 product of the day."},
  {name:"Daniel M.",flag:"🇺🇸",stars:5,platform:"reddit",text:"The launch consultation call gave us confidence to press go. Best $179 we spent."},
  {name:"Priya S.",flag:"🇮🇳",stars:5,platform:"telegram",text:"Flawless process from intake to delivery. Attentive team, genuinely thorough testing."},
];

/* ─── REVIEW CARD ─────────────────────────────────────────────────────────── */
function ReviewCard({ review, index }) {
  return (
    <div style={{ background:"#0c1120", border:"1px solid rgba(56,189,248,0.1)", borderRadius:14,
      padding:"18px 20px", width:296, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Avatar name={review.name} index={index} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:13, color:"#e6edf7", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {review.name} <span style={{fontSize:14}}>{review.flag}</span>
          </div>
          <div style={{ display:"flex", gap:1, marginTop:2 }}>{STARS(review.stars)}</div>
        </div>
        <div style={{ color:"#374151", flexShrink:0 }}>{PI[review.platform]}</div>
      </div>
      <p style={{ margin:0, fontSize:13, color:"#64748b", lineHeight:1.6 }}>"{review.text}"</p>
    </div>
  );
}

function MarqueeRow({ reviews, dir="left", speed=48 }) {
  const doubled = [...reviews, ...reviews];
  return (
    <div style={{ overflow:"hidden", width:"100%" }}>
      <div style={{ display:"flex", gap:14, width:"max-content",
        animation:`${dir==="left"?"marquee-left":"marquee-right"} ${speed}s linear infinite` }}>
        {doubled.map((r,i) => <ReviewCard key={i} review={r} index={i} />)}
      </div>
    </div>
  );
}

/* ─── PHONE MOCKUP ────────────────────────────────────────────────────────── */
const TESTS = [
  { label:"Performance Testing",  result:"PASS",    color:"#4ade80", delay:0.4 },
  { label:"UI/UX Validation",     result:"PASS",    color:"#4ade80", delay:0.9 },
  { label:"Bug Discovery",        result:"12 found",color:"#fb923c", delay:1.4 },
  { label:"Device Compat.",       result:"PASS",    color:"#4ade80", delay:1.9 },
  { label:"Security Scan",        result:"PASS",    color:"#4ade80", delay:2.4 },
  { label:"Launch Readiness",     result:"✓ Ready", color:"#38bdf8", delay:2.9 },
];

function PhoneMockup() {
  return (
    <div style={{ position:"relative", display:"flex", justifyContent:"center" }}>
      {/* Floating badges */}
      <div className="badge-tl" style={{ position:"absolute", top:40, left:-60, zIndex:10,
        background:"rgba(10,16,30,0.92)", border:"1px solid rgba(56,189,248,0.3)", borderRadius:14,
        padding:"10px 14px", backdropFilter:"blur(16px)", animation:"badge-float-a 4s ease-in-out infinite" }}>
        <div style={{ fontSize:10, color:"#38bdf8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Satisfaction</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.04em" }}>98%</div>
      </div>
      <div className="badge-br" style={{ position:"absolute", bottom:80, right:-70, zIndex:10,
        background:"rgba(10,16,30,0.92)", border:"1px solid rgba(212,175,106,0.3)", borderRadius:14,
        padding:"10px 14px", backdropFilter:"blur(16px)", animation:"badge-float-b 4.5s ease-in-out infinite" }}>
        <div style={{ fontSize:10, color:"#d4af6a", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Response</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.04em" }}>&lt;48hr</div>
      </div>
      <div className="badge-ml" style={{ position:"absolute", top:"45%", left:-80, zIndex:10,
        background:"rgba(10,16,30,0.92)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:14,
        padding:"10px 14px", backdropFilter:"blur(16px)", animation:"badge-float-c 3.8s ease-in-out infinite" }}>
        <div style={{ fontSize:10, color:"#4ade80", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Real Testers</div>
        <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.04em" }}>30+</div>
      </div>

      {/* Phone frame */}
      <div className="phone-frame" style={{ width:270, height:540, borderRadius:40,
        background:"linear-gradient(170deg,#0c1426 0%,#06090f 100%)",
        border:"1.5px solid rgba(56,189,248,0.25)",
        boxShadow:"0 0 0 1px rgba(56,189,248,0.08), 0 50px 120px -20px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow:"hidden", position:"relative",
        animation:"float-phone 6s ease-in-out infinite, pulse-glow 4s ease-in-out infinite" }}>

        {/* Screen scan line */}
        <div style={{ position:"absolute", left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)",
          animation:"scanning-line 3s linear infinite", zIndex:5, pointerEvents:"none" }} />

        {/* Status bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 18px 8px", fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:"'JetBrains Mono',monospace" }}>
          <span>9:41</span>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span>▂▄▆</span><span>📶</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ padding:"6px 18px 14px", borderBottom:"1px solid rgba(56,189,248,0.1)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:"#38bdf8", fontWeight:700, letterSpacing:"0.1em",
                fontFamily:"'JetBrains Mono',monospace", textTransform:"uppercase" }}>T/R QA</div>
              <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em" }}>Launch Report</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5,
              background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.25)",
              borderRadius:20, padding:"4px 10px" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"block",
                animation:"live-blink 1.4s ease-in-out infinite" }} />
              <span style={{ fontSize:10,fontWeight:700,color:"#4ade80",letterSpacing:"0.06em" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(56,189,248,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, color:"#64748b", fontWeight:600 }}>Testing Progress</span>
            <span style={{ fontSize:11, color:"#38bdf8", fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>94%</span>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99,
              background:"linear-gradient(90deg, #38bdf8, #818cf8)",
              animation:"bar-fill 2s cubic-bezier(.4,0,.2,1) 0.5s both",
              boxShadow:"0 0 8px rgba(56,189,248,0.7)" }} />
          </div>
          <div style={{ fontSize:10, color:"#475569", marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>
            28 of 30 tests passed
          </div>
        </div>

        {/* Test list */}
        <div style={{ padding:"10px 18px", display:"flex", flexDirection:"column", gap:4, flex:1 }}>
          {TESTS.map((t,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"7px 10px", borderRadius:10,
              background: i===5 ? "rgba(56,189,248,0.07)" : "rgba(255,255,255,0.02)",
              border: i===5 ? "1px solid rgba(56,189,248,0.15)" : "1px solid transparent",
              animation:`slide-in 0.4s ease ${t.delay}s both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:18,height:18,borderRadius:6,
                  background: i===5 ? "rgba(56,189,248,0.15)" : "rgba(74,222,128,0.12)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  animation:`check-pop 0.4s cubic-bezier(.34,1.56,.64,1) ${t.delay+0.1}s both` }}>
                  {i===5
                    ? <span style={{fontSize:8,color:"#38bdf8"}}>✦</span>
                    : <span style={{fontSize:8,color:"#4ade80"}}>✓</span>
                  }
                </div>
                <span style={{ fontSize:11,color:"#94a3b8",fontWeight:500 }}>{t.label}</span>
              </div>
              <span style={{ fontSize:10,fontWeight:700,color:t.color,fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.02em" }}>{t.result}</span>
            </div>
          ))}
        </div>

        {/* Bottom button */}
        <div style={{ padding:"12px 18px 16px" }}>
          <div style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)", borderRadius:12,
            padding:"10px 0", textAlign:"center", cursor:"pointer",
            boxShadow:"0 4px 16px rgba(56,189,248,0.35)" }}>
            <span style={{ fontSize:12,fontWeight:800,color:"#061018",letterSpacing:"0.02em" }}>
              View Full Report →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SERVICE SNAP CARDS ─────────────────────────────────────────────────── */
const SNAP_CARDS = [
  { icon:"🛡️", title:"App Rescue",         desc:"Emergency fixes for broken or crashing apps — 7-day sprint." },
  { icon:"🔍", title:"QA Testing",          desc:"30 real human testers. Deep bug reports before you launch." },
  { icon:"📋", title:"Technical Audit",     desc:"Code quality, security, and architecture deep-dive." },
  { icon:"⚡", title:"Performance Boost",   desc:"Speed, stability, and retention improvements — guaranteed." },
];

/* ─── HOW IT WORKS ───────────────────────────────────────────────────────── */
const STEPS = [
  { n:"01", icon:"📝", title:"Submit Intake",    desc:"Fill our 3-minute intake. Tell us your app, platform, and what needs testing." },
  { n:"02", icon:"🔬", title:"Deep Analysis",    desc:"Our QA team assigns 12–30 real testers and begins structured testing within 24 hours." },
  { n:"03", icon:"📊", title:"Report & Launch",  desc:"Receive a detailed QA report with findings, fixes, and a launch readiness verdict." },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function Home() {
  const row1 = REVIEWS.slice(0, 21);
  const row2 = REVIEWS.slice(21);

  return (
    <>
      <style>{ALL_STYLES}</style>

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section style={{ position:"relative", overflow:"hidden", background:"#010208", minHeight:"100vh" }}>

        {/* Aurora blobs — vivid & dramatic */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:900, height:900, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(56,189,248,0.32) 0%, rgba(56,189,248,0.06) 50%, transparent 70%)",
            filter:"blur(50px)", top:"-30%", left:"-15%",
            animation:"blob1 16s ease-in-out infinite" }} />
          <div style={{ position:"absolute", width:800, height:800, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(129,140,248,0.28) 0%, rgba(129,140,248,0.05) 50%, transparent 70%)",
            filter:"blur(60px)", top:"5%", right:"-10%",
            animation:"blob2 20s ease-in-out infinite" }} />
          <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(212,175,106,0.2) 0%, rgba(212,175,106,0.04) 50%, transparent 70%)",
            filter:"blur(70px)", bottom:"-5%", left:"30%",
            animation:"blob3 18s ease-in-out infinite" }} />
          <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 65%)",
            filter:"blur(90px)", top:"50%", right:"20%",
            animation:"blob1 22s ease-in-out infinite reverse" }} />
        </div>

        {/* Fine dot grid */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"radial-gradient(rgba(56,189,248,0.15) 1px, transparent 1px)",
          backgroundSize:"32px 32px",
          maskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 10%, transparent 80%)",
          WebkitMaskImage:"radial-gradient(ellipse 80% 60% at 50% 40%, black 10%, transparent 80%)" }} />

        {/* Horizontal accent line */}
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, pointerEvents:"none",
          background:"linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.12) 30%, rgba(56,189,248,0.12) 70%, transparent 100%)" }} />

        {/* Bottom vignette */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"linear-gradient(to bottom, transparent 60%, rgba(1,2,8,0.95) 100%)" }} />

        {/* Content */}
        <div className="hero-wrap">
          {/* LEFT — Text */}
          <div className="hero-text">
            {/* Live badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              padding:"7px 14px", borderRadius:999,
              border:"1px solid rgba(56,189,248,0.3)",
              background:"rgba(56,189,248,0.07)", marginBottom:28,
              animation:"fade-up 0.7s ease both" }}>
              <span style={{ position:"relative", display:"flex" }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:"#38bdf8",display:"block",
                  animation:"live-blink 1.6s ease-in-out infinite" }} />
                <span style={{ position:"absolute",inset:0,borderRadius:"50%",background:"#38bdf8",
                  animation:"ping-ring 1.6s ease-out infinite" }} />
              </span>
              <span style={{ fontSize:11,fontWeight:700,color:"#38bdf8",letterSpacing:"0.12em",textTransform:"uppercase",
                fontFamily:"'JetBrains Mono',monospace" }}>Elite Mobile QA & Testing</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize:"clamp(40px,5.5vw,72px)", fontWeight:900, lineHeight:1.03,
              letterSpacing:"-0.035em", margin:"0 0 22px", color:"#f8fafc",
              animation:"fade-up 0.7s ease 0.1s both" }}>
              Your App. Fixed.<br />
              <span style={{ background:"linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #d4af6a 100%)",
                backgroundSize:"200% 200%", animation:"gradient-text 5s ease infinite",
                WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                Fast. Guaranteed.
              </span>
            </h1>

            {/* Subhead */}
            <p style={{ fontSize:"clamp(16px,1.6vw,19px)", color:"#64748b", margin:"0 0 0",
              maxWidth:500, lineHeight:1.7, animation:"fade-up-d2 0.9s ease 0.1s both" }}>
              Elite QA testing, app rescue, and launch readiness for global startups.{" "}
              <strong style={{ color:"#94a3b8", fontWeight:600 }}>Ship with confidence</strong> — not guesswork.
            </p>

            {/* CTAs */}
            <div className="h-cta-row" style={{ animation:"fade-up-d3 0.9s ease 0.1s both" }}>
              <Link to="/intake" style={{ display:"inline-flex", alignItems:"center", gap:10,
                padding:"15px 28px", borderRadius:14,
                background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",
                color:"#03080f", fontWeight:800, fontSize:15,
                boxShadow:"0 0 0 1px rgba(56,189,248,0.4), 0 12px 36px -8px rgba(56,189,248,0.65)",
                textDecoration:"none", letterSpacing:"-0.01em", transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 0 0 1px rgba(56,189,248,0.5), 0 20px 48px -8px rgba(56,189,248,0.75)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 0 0 1px rgba(56,189,248,0.4), 0 12px 36px -8px rgba(56,189,248,0.65)";}}>
                Get Started — Free Consult
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/services" style={{ display:"inline-flex", alignItems:"center", gap:8,
                padding:"15px 22px", borderRadius:14,
                border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8",
                fontWeight:600, fontSize:14, textDecoration:"none", transition:"all .2s",
                background:"rgba(255,255,255,0.03)" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(56,189,248,0.3)";e.currentTarget.style.color="#38bdf8";e.currentTarget.style.background="rgba(56,189,248,0.05)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="#94a3b8";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
                View Services
              </Link>
            </div>

            {/* Trust row */}
            <div className="h-trust" style={{ animation:"fade-up-d4 0.9s ease 0.1s both" }}>
              {/* Avatar stack */}
              <div className="h-avatars">
                {["JK","SM","EO","CB","LR"].map((init,i) => (
                  <div key={i} style={{ width:32,height:32,borderRadius:"50%",
                    background:AVATAR_COLORS[i][0], border:"2px solid #03050d",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:10,fontWeight:700,color:AVATAR_COLORS[i][1],
                    fontFamily:"'JetBrains Mono',monospace",
                    marginLeft: i===0 ? 0 : -8, position:"relative", zIndex:5-i }}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>40+ founders trust us</div>
                <div style={{ fontSize:11, color:"#475569" }}>Across 🇺🇸 🇬🇧 🇳🇬 and beyond</div>
              </div>
              <div style={{ width:1, height:28, background:"rgba(255,255,255,0.08)", margin:"0 4px" }} />
              <Link to="/login" style={{ fontSize:13, color:"#475569", textDecoration:"none",
                transition:"color .15s", fontWeight:500 }}
                onMouseEnter={e=>{e.currentTarget.style.color="#38bdf8";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
                Already a client? Sign in →
              </Link>
            </div>
          </div>

          {/* RIGHT — Phone */}
          <div className="hero-phone">
            <PhoneMockup />
          </div>
        </div>

        {/* Scroll arrow */}
        <div style={{ position:"absolute", bottom:28, left:"50%",
          animation:"scroll-bounce 2.2s ease-in-out infinite",
          color:"rgba(56,189,248,0.4)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST STRIP — Platform logos
      ══════════════════════════════════════════════ */}
      <div style={{ background:"#050810", borderTop:"1px solid rgba(56,189,248,0.07)",
        borderBottom:"1px solid rgba(56,189,248,0.07)", padding:"22px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <p style={{ textAlign:"center", fontSize:11, color:"#334155", fontWeight:600,
            letterSpacing:"0.18em", textTransform:"uppercase", margin:"0 0 18px",
            fontFamily:"'JetBrains Mono',monospace" }}>Tested & launched on</p>
          <div className="trust-strip">
            {[
              { name:"Google Play", icon:"🤖" },
              { name:"App Store",   icon:"🍎" },
              { name:"TestFlight",  icon:"✈️" },
              { name:"Firebase",    icon:"🔥" },
              { name:"Discord",     icon:"💬" },
              { name:"Replit",      icon:"🔷" },
            ].map((p,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7,
                color:"#334155", fontSize:13, fontWeight:600, transition:"color .2s" }}>
                <span style={{ fontSize:16 }}>{p.icon}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2 — WHAT WE DO
      ══════════════════════════════════════════════ */}
      <section style={{ padding:"96px 24px", background:"#050810" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#38bdf8",
              textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:14 }}>// What We Do</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.025em",
              margin:"0 0 14px", color:"#f1f5f9" }}>
              Built for Founders Who Ship
            </h2>
            <p style={{ color:"#475569", fontSize:17, maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>
              End-to-end quality assurance so your app launches clean, stays stable, and keeps users.
            </p>
          </div>
          <div className="svc-snap-grid">
            {SNAP_CARDS.map((c,i) => (
              <div key={i}
                style={{ background:"linear-gradient(145deg,#0c1426,#080d1a)", borderRadius:18,
                  border:"1px solid rgba(56,189,248,0.1)", padding:"28px 24px",
                  transition:"all .3s", cursor:"default", position:"relative", overflow:"hidden" }}
                onMouseEnter={e=>{
                  e.currentTarget.style.borderColor="rgba(56,189,248,0.3)";
                  e.currentTarget.style.transform="translateY(-5px)";
                  e.currentTarget.style.boxShadow="0 24px 48px -16px rgba(56,189,248,0.2), 0 0 0 1px rgba(56,189,248,0.08)";
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.borderColor="rgba(56,189,248,0.1)";
                  e.currentTarget.style.transform="";
                  e.currentTarget.style.boxShadow="";
                }}>
                <div style={{ position:"absolute", top:0, right:0, width:80, height:80,
                  background:"radial-gradient(circle at 80% 20%, rgba(56,189,248,0.08), transparent 70%)",
                  pointerEvents:"none" }} />
                <div style={{ fontSize:30, marginBottom:16 }}>{c.icon}</div>
                <h3 style={{ margin:"0 0 10px", fontSize:17, fontWeight:800, color:"#e2e8f0", letterSpacing:"-0.02em" }}>{c.title}</h3>
                <p style={{ margin:0, color:"#475569", fontSize:13.5, lineHeight:1.65 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — STATS
      ══════════════════════════════════════════════ */}
      <section style={{ padding:"0 24px 80px", background:"#050810" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="stats-grid">
            {[
              { num:"40+",    label:"Happy Clients",    sub:"and counting" },
              { num:"98%",    label:"Satisfaction Rate", sub:"across all packages" },
              { num:"<48hr",  label:"First Response",    sub:"guaranteed" },
              { num:"3",      label:"Continents",        sub:"USA · UK · Africa" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#080d1a", padding:"32px 24px", textAlign:"center" }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",
                  fontSize:"clamp(28px,4vw,42px)", fontWeight:900, color:"#38bdf8",
                  letterSpacing:"-0.04em", marginBottom:6, lineHeight:1 }}>{s.num}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:11, color:"#334155", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.06em" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — REVIEWS MARQUEE
      ══════════════════════════════════════════════ */}
      <section id="reviews" style={{ padding:"96px 0", background:"#03050d",
        borderTop:"1px solid rgba(56,189,248,0.07)", overflow:"hidden" }}>
        <div style={{ textAlign:"center", marginBottom:52, padding:"0 24px" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#38bdf8",
            textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:14 }}>// Client Reviews</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.025em",
            margin:"0 0 14px", color:"#f1f5f9" }}>
            What Founders Are Saying
          </h2>
          <p style={{ color:"#475569", fontSize:16, maxWidth:440, margin:"0 auto", lineHeight:1.65 }}>
            42 founders across 3 continents shipped with confidence using T/R Agency.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <MarqueeRow reviews={row1} dir="left"  speed={52} />
          <MarqueeRow reviews={row2} dir="right" speed={58} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section style={{ padding:"96px 24px", background:"#050810",
        borderTop:"1px solid rgba(56,189,248,0.07)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#38bdf8",
              textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:14 }}>// How It Works</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.025em",
              margin:"0 0 14px", color:"#f1f5f9" }}>
              Three Steps to Launch Ready
            </h2>
            <p style={{ color:"#475569", fontSize:16, maxWidth:440, margin:"0 auto" }}>
              From intake to full QA report — fast, structured, and guaranteed.
            </p>
          </div>
          <div className="how-grid">
            {STEPS.map((s,i) => (
              <div key={i} style={{ position:"relative" }}>
                {/* Connector line */}
                {i < 2 && (
                  <div style={{ position:"absolute", top:28, left:"calc(100% + 0px)", width:"calc(100% - 48px)",
                    height:1, background:"linear-gradient(90deg,rgba(56,189,248,0.3),transparent)",
                    display:"none" }} />
                )}
                <div style={{ background:"linear-gradient(145deg,#0c1426,#080d1a)",
                  border:"1px solid rgba(56,189,248,0.1)", borderRadius:18,
                  padding:"32px 28px", textAlign:"center",
                  transition:"all .25s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(56,189,248,0.28)"; e.currentTarget.style.transform="translateY(-4px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(56,189,248,0.1)"; e.currentTarget.style.transform="";}}>
                  <div style={{ width:56, height:56, borderRadius:16,
                    background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.18)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto 18px", fontSize:24 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11,
                    color:"#38bdf8", fontWeight:700, letterSpacing:"0.1em",
                    marginBottom:10, textTransform:"uppercase" }}>{s.n}</div>
                  <h3 style={{ margin:"0 0 12px", fontSize:18, fontWeight:800, color:"#e2e8f0",
                    letterSpacing:"-0.02em" }}>{s.title}</h3>
                  <p style={{ margin:0, color:"#475569", fontSize:14, lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — FINAL CTA
      ══════════════════════════════════════════════ */}
      <section style={{ padding:"110px 24px", background:"#03050d",
        borderTop:"1px solid rgba(56,189,248,0.07)", textAlign:"center",
        position:"relative", overflow:"hidden" }}>
        {/* Glow */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 65% 55% at 50% 0%, rgba(56,189,248,0.14), transparent 65%)" }} />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 40% 40% at 50% 80%, rgba(129,140,248,0.08), transparent 70%)" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:999, marginBottom:28,
            border:"1px solid rgba(56,189,248,0.2)", background:"rgba(56,189,248,0.06)" }}>
            <span style={{ fontSize:14 }}>🚀</span>
            <span style={{ fontSize:11, fontWeight:700, color:"#38bdf8",
              letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
              Free to start
            </span>
          </div>
          <h2 style={{ fontSize:"clamp(32px,5vw,58px)", fontWeight:900, letterSpacing:"-0.035em",
            margin:"0 0 18px", color:"#f8fafc", lineHeight:1.08 }}>
            Ready to rescue<br />your app?
          </h2>
          <p style={{ color:"#475569", fontSize:17, margin:"0 0 44px", lineHeight:1.7,
            maxWidth:500, marginLeft:"auto", marginRight:"auto" }}>
            Tell us about your project — we'll map out the right QA path.
            No commitment, no contracts, just results.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
            <Link to="/intake" style={{ display:"inline-flex", alignItems:"center", gap:10,
              padding:"17px 36px", borderRadius:14,
              background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",
              color:"#03080f", fontWeight:800, fontSize:16, textDecoration:"none",
              boxShadow:"0 14px 40px -8px rgba(56,189,248,0.65)",
              transition:"all .2s", letterSpacing:"-0.01em" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 20px 48px -8px rgba(56,189,248,0.8)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 14px 40px -8px rgba(56,189,248,0.65)";}}>
              Start Now — It's Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/services" style={{ display:"inline-flex", alignItems:"center", gap:8,
              padding:"17px 26px", borderRadius:14,
              border:"1px solid rgba(255,255,255,0.1)", color:"#64748b",
              fontWeight:600, fontSize:15, textDecoration:"none",
              background:"rgba(255,255,255,0.03)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(56,189,248,0.3)"; e.currentTarget.style.color="#38bdf8";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#64748b";}}>
              See Packages
            </Link>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
            gap:18, flexWrap:"wrap" }}>
            {["🔒 Secure & Private","⚡ < 48hr Response","✅ No Commitment"].map((item,i) => (
              <span key={i} style={{ fontSize:13, color:"#334155", fontWeight:500 }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ background:"#020408", borderTop:"1px solid rgba(56,189,248,0.08)",
        padding:"52px 24px 36px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="footer-top">
            {/* Brand */}
            <div>
              <Link to="/" style={{ display:"flex", alignItems:"center", gap:10,
                textDecoration:"none", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center" }}>
                  <img src="/logo.png" alt="T/R Agency" style={{ height:38, width:"auto", display:"block", borderRadius:8 }} />
                </div>
                <span style={{ fontWeight:800, fontSize:15, color:"#e2e8f0" }}>
                  T<span style={{ color:"#38bdf8" }}>/</span>R Agency
                </span>
              </Link>
              <p style={{ margin:0, color:"#334155", fontSize:13, maxWidth:220, lineHeight:1.7 }}>
                Mobile QA Testing & Launch Readiness for global startups.
              </p>
              {/* Social */}
              <div style={{ display:"flex", gap:8, marginTop:20 }}>
                {[
                  { href:"https://x.com/tragencyops?s=21", title:"@tragencyops on X", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> },
                  { href:"https://t.me/EvelynVerabot", title:"AI Assistant @EvelynVerabot", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h4V5.72A2 2 0 0 1 10 4a2 2 0 0 1 2-2zM7 9a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H7zm2 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 3h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1 0-1z"/></svg> },
                  { href:"https://t.me/trapptesterdevelopers", title:"Telegram Community", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                  { href:"https://discord.gg/G5cTHe87uQ", title:"Discord Community", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg> },
                ].map((s,i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                    style={{ width:36,height:36,borderRadius:10, display:"flex",alignItems:"center",
                      justifyContent:"center", background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(56,189,248,0.12)", color:"#475569",
                      textDecoration:"none", transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,189,248,0.1)"; e.currentTarget.style.color="#38bdf8"; e.currentTarget.style.borderColor="rgba(56,189,248,0.3)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color="#475569"; e.currentTarget.style.borderColor="rgba(56,189,248,0.12)";}}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav groups */}
            <div className="footer-nav-group">
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#334155",
                  textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Company</div>
                <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                  {[{l:"About",to:"/about"},{l:"Services",to:"/services"},{l:"Reviews",to:"/#reviews"},{l:"Portal",to:"/portal"}].map(lk => (
                    <Link key={lk.l} to={lk.to} style={{ color:"#475569", fontSize:14,
                      textDecoration:"none", transition:"color .15s", fontWeight:500 }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#e2e8f0";}}
                      onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
                      {lk.l}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"#334155",
                  textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Support</div>
                <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                  <a href="mailto:tragency.ops@proton.me" style={{ color:"#475569", fontSize:14,
                    textDecoration:"none", transition:"color .15s", fontWeight:500 }}
                    onMouseEnter={e=>{e.currentTarget.style.color="#38bdf8";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
                    tragency.ops@proton.me
                  </a>
                  <Link to="/intake" style={{ color:"#475569", fontSize:14,
                    textDecoration:"none", transition:"color .15s", fontWeight:500 }}
                    onMouseEnter={e=>{e.currentTarget.style.color="#e2e8f0";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
                    Start a Consult
                  </Link>
                  <a href="https://discord.gg/G5cTHe87uQ" target="_blank" rel="noopener noreferrer"
                    style={{ color:"#475569", fontSize:14, textDecoration:"none", transition:"color .15s", fontWeight:500 }}
                    onMouseEnter={e=>{e.currentTarget.style.color="#e2e8f0";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#475569";}}>
                    Discord Community
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:"1px solid rgba(56,189,248,0.06)", paddingTop:24,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap:12 }}>
            <span style={{ color:"#1e293b", fontSize:13 }}>
              © {new Date().getFullYear()} T/R Agency. All rights reserved.
            </span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10,
              color:"#1e293b", letterSpacing:"0.12em" }}>
              MOBILE QA · LAUNCH TESTING · APP RESCUE
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
