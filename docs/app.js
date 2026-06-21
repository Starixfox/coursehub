import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const app = document.getElementById("app");
const navEl = document.getElementById("nav");
const SAMPLE_HLS =
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8";
const ASIDE_IMG = "https://ddkujivsfnqvnhubzjjy.supabase.co/storage/v1/object/public/course-images/_aside.jpg";

const TIER_RANK = { free: 0, basic: 1, pro: 2, premium: 3 };
const TIERS = [
  { id: "free", name: "Free", price: 0, blurb: "Preview the platform",
    features: ["Browse the full catalog", "Watch every preview lesson", "Track your progress"] },
  { id: "basic", name: "Basic", price: 12, blurb: "A focused path",
    features: ["Everything in Free", "Full access to Basic courses", "Standard 720p video", "Resume across devices"] },
  { id: "pro", name: "Pro", price: 29, blurb: "The whole catalog", highlight: true,
    features: ["Everything in Basic", "Full catalog (Basic + Pro)", "Crisp 1080p video", "Downloadable resources"] },
  { id: "premium", name: "Premium", price: 59, blurb: "For teams & pros",
    features: ["Everything in Pro", "Early access to new courses", "Completion certificates", "Up to 5 team seats", "4K video"] },
];

const ICONS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".6" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".6" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".6" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.43-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h1.99c3.05 0 5.56-2.5 5.56-5.55C21.96 6.01 17.46 2 12 2z"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  chart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  unlock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  infinity: '<path d="M6 16c3 0 5-8 8-8a4 4 0 0 1 0 8c-3 0-5-8-8-8a4 4 0 0 0 0 8Z"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M3 7.5h4M17 3v18M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>',
  arrow: '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  close: '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>',
};
const icon = (n, attrs = "") =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICONS[n] || ""}</svg>`;
const CAT_ICON = { Development: "code", Design: "palette", Business: "briefcase", Data: "chart", Marketing: "megaphone" };

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s || "");

let session = null;
let profile = null;
let tier = "free";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
const fmtDur = (s) => {
  s = Number(s) || 0;
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : m ? `${m}m` : `${s}s`;
};
const tierBadge = (t) => `<span class="tier-pill ${t}">${esc(cap(t))}</span>`;
const statusLabel = (s) => `<span class="label ${s === "published" ? "gold" : ""}">${esc(s)}</span>`;
const go = (hash) => (location.hash = hash);
const parseYouTube = (u) => {
  if (!u) return null;
  const s = String(u).trim();
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|[?&]v=)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  return null;
};
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const sanitize = (html) =>
  DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS: ["h1","h2","h3","h4","p","blockquote","ul","ol","li","b","i","strong","em","u","s","code","pre","a","img","figure","figcaption","hr","br","span","table","thead","tbody","tr","th","td"],
    ALLOWED_ATTR: ["href","name","target","rel","src","alt","width","height","class"],
    ALLOWED_URI_REGEXP: /^(https:|mailto:|data:image\/)/i,
  });

async function requireRole(roles) {
  if (!session) { go("#/login"); return false; }
  if (!roles.includes(profile?.role)) { go("#/dashboard"); return false; }
  return true;
}

async function loadSession() {
  const { data } = await supabase.auth.getSession();
  session = data.session || null;
  if (session) {
    const [{ data: prof }, { data: t }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
      supabase.rpc("my_current_tier"),
    ]);
    profile = prof || null;
    tier = t || "free";
  } else {
    profile = null;
    tier = "free";
  }
}

async function signOut() { await supabase.auth.signOut(); await loadSession(); go("#/"); router(); }

function renderNav() {
  const isStaff = profile?.role === "creator" || profile?.role === "admin";
  const right = session
    ? `${tierBadge(tier)}
       ${isStaff ? `<a class="btn btn-ghost btn-sm" href="#/creator">Studio</a>` : ""}
       ${profile?.role === "admin" ? `<a class="btn btn-ghost btn-sm" href="#/admin">Admin</a>` : ""}
       <a class="btn btn-ghost btn-sm" href="#/account">Account</a>
       <button class="btn btn-outline btn-sm" id="signout">Sign out</button>`
    : `<a class="btn btn-ghost btn-sm" href="#/login">Log in</a>
       <a class="btn btn-primary btn-sm" href="#/register">Get started</a>`;
  const mobile = session
    ? `<a href="#/catalog">Courses</a><a href="#/pricing">Pricing</a><a href="#/dashboard">Dashboard</a>
       ${isStaff ? `<a href="#/creator">Studio</a>` : ""}${profile?.role === "admin" ? `<a href="#/admin">Admin</a>` : ""}
       <a href="#/account">Account</a><a href="#/certificates">Certificates</a><a href="#" id="signout-m">Sign out</a>`
    : `<a href="#/catalog">Courses</a><a href="#/pricing">Pricing</a><a href="#/login">Log in</a><a href="#/register">Get started</a>`;
  navEl.innerHTML = `
    <a class="brand" href="#/">Course<b>Hub</b></a>
    <nav class="nav-links">
      <a href="#/catalog">Courses</a>
      <a href="#/pricing">Pricing</a>
      ${session ? `<a href="#/dashboard">Dashboard</a>` : ""}
    </nav>
    <div class="nav-spacer"></div>
    <div class="nav-right">${right}</div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Menu">${icon("menu", 'width="20" height="20"')}</button>
    <div class="mobile-menu" id="mobile-menu">${mobile}</div>`;
  const so = document.getElementById("signout");
  if (so) so.onclick = signOut;
  const som = document.getElementById("signout-m");
  if (som) som.onclick = (e) => { e.preventDefault(); signOut(); };
  const tg = document.getElementById("nav-toggle"), mm = document.getElementById("mobile-menu");
  if (tg) tg.onclick = () => { const open = mm.classList.toggle("open"); tg.innerHTML = icon(open ? "close" : "menu", 'width="20" height="20"'); };
}

/* ---------------- data ---------------- */
async function getCourses({ search, category, tier: ftier } = {}) {
  let q = supabase.from("courses").select("*").eq("status", "published").order("students_count", { ascending: false });
  if (category) q = q.eq("category", category);
  if (ftier) q = q.eq("required_tier", ftier);
  if (search) q = q.ilike("title", `%${search}%`);
  const { data } = await q;
  return data || [];
}
async function getCourse(slug) {
  const { data } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
  return data;
}
async function getCurriculum(courseId) {
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from("modules").select("*").eq("course_id", courseId).order("position"),
    supabase.from("lessons").select("*").eq("course_id", courseId).order("position"),
  ]);
  return (modules || []).map((m) => ({ ...m, lessons: (lessons || []).filter((l) => l.module_id === m.id) }));
}

/* ---------------- shared view bits ---------------- */
const courseCard = (c) => `
  <article class="course-card reveal" onclick="location.hash='#/course/${esc(c.slug)}'">
    <div class="thumb">
      <img src="${esc(c.image_url || "")}" alt="${esc(c.title)}" loading="lazy" />
      <div class="labels">
        ${tierBadge(c.required_tier)}
        ${c.category ? `<span class="label solid">${esc(c.category)}</span>` : ""}
      </div>
    </div>
    <div class="body">
      <h3>${esc(c.title)}</h3>
      <p class="sub">${esc(c.subtitle || "")}</p>
      <div class="course-meta">
        ${c.rating ? `<span class="star">★ ${c.rating}</span><span class="dot"></span>` : ""}
        <span>${fmtNum(c.students_count)} learners</span>
        ${c.level ? `<span class="dot"></span><span>${esc(c.level)}</span>` : ""}
      </div>
    </div>
  </article>`;

/* ---------------- views ---------------- */
async function viewHome() {
  const courses = await getCourses();
  const cats = [...new Set(courses.map((c) => c.category).filter(Boolean))];
  const totalStudents = courses.reduce((n, c) => n + (c.students_count || 0), 0);
  const rated = courses.filter((c) => c.rating);
  const avg = rated.length ? rated.reduce((n, c) => n + Number(c.rating), 0) / rated.length : 0;
  const popular = courses.slice(0, 6);
  const feat = popular[0] || {};
  const testimonials = [
    ["Maya Reyes", "Frontend Developer", 5, "I went from following tutorials to shipping a real Next.js app in a month. The lessons are short and the projects actually stick."],
    ["Daniel Kerr", "Product Manager", 5, "The PM track gave me frameworks I now use every single week. Worth the subscription on its own."],
    ["Aisha Noor", "Data Analyst", 5, "Clear, practical and no fluff. I finally understand pandas instead of copy-pasting from forums."],
  ];
  const faqs = [
    ["What is CourseHub?", "CourseHub is a subscription learning platform. One membership unlocks a growing library of expert-led video courses across development, design, data, business and marketing — learn at your own pace, on any device."],
    ["What do I get with a subscription?", "Full access to every course your plan includes: stream all lessons, download resources on Pro and above, track your progress, and resume right where you left off."],
    ["Can I try it before subscribing?", "Yes. Every course has free preview lessons, and you can browse the entire catalog without an account."],
    ["Can I cancel anytime?", "Absolutely — plans are month-to-month and you keep access until the end of your billing period."],
    ["Do I earn a certificate?", "Premium members earn a shareable certificate of completion for every course they finish."],
    ["How is paid content protected?", "Your access is secured on our servers, so paid lessons stay locked until you subscribe to a plan that includes them."],
  ];
  const features = [
    ["cap", "Expert-led courses", "Every course is taught by a working practitioner and broken into short, focused lessons you can finish in a sitting."],
    ["unlock", "One membership, full access", "Subscribe to a plan and instantly unlock everything it includes. Preview lessons are always free."],
    ["award", "Certificates that count", "Finish a course on Premium and earn a shareable certificate for your résumé and LinkedIn."],
  ];
  const initials = ["MR", "DK", "AN", "JL"];
  app.innerHTML = `
    <section class="hero container">
      <div class="reveal">
        <span class="eyebrow">Subscription learning</span>
        <h1>Learn skills that <em>actually move</em> your career.</h1>
        <p>Stream expert-led courses across development, design, data, business and marketing — track your progress, earn certificates, and unlock more as you grow.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="#/catalog">Explore courses ${icon("arrow")}</a>
          <a class="btn btn-outline btn-lg" href="#/pricing">View plans</a>
        </div>
        <div class="hero-trust">
          <div class="avatars">${initials.map((i) => `<span style="background:var(--gold-soft);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:var(--serif)">${i}</span>`).join("")}</div>
          <div class="t"><b>${fmtNum(totalStudents)}+</b> learners · <span class="gold">★ ${avg.toFixed(1)}</span> average rating</div>
        </div>
      </div>
      <div class="hero-visual reveal">
        <div class="hero-card" onclick="location.hash='#/course/${esc(feat.slug || "")}'">
          <img src="${esc(feat.image_url || "")}" alt="${esc(feat.title || "")}" />
          <div class="glow"></div>
          <button class="play-btn" aria-label="Preview">${icon("play", 'width="24" height="24"')}</button>
          <div class="meta">${tierBadge(feat.required_tier || "pro")}<h3>${esc(feat.title || "")}</h3></div>
        </div>
        <div class="float-chip"><span class="n">${feat.rating || "4.8"}</span><span class="l">Top rated<br/>this week</span></div>
        <div class="float-chip bl"><span class="n">${courses.length}</span><span class="l">Courses &<br/>growing</span></div>
      </div>
    </section>

    <div class="container reveal"><div class="statbar">
      <div class="s"><b>${courses.length}</b><span>Courses</span></div>
      <div class="s"><b>${fmtNum(totalStudents)}+</b><span>Learners enrolled</span></div>
      <div class="s"><b>${avg.toFixed(1)}/5</b><span>Average rating</span></div>
      <div class="s"><b>${cats.length}</b><span>Categories</span></div>
      <div class="s"><b>4</b><span>Membership tiers</span></div>
    </div></div>

    <section class="section container">
      <div class="cols-3">
        ${features.map(([ic, h, p]) => `<div class="card feature reveal"><div class="ico">${icon(ic)}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}
      </div>
    </section>

    <section class="section container">
      <div class="section-head reveal"><div><span class="eyebrow">Categories</span><h2 style="margin-top:10px">Browse by what you want to learn</h2></div></div>
      <div class="cat-grid">${cats.map((catName) => `
        <a class="cat-card reveal" href="#/catalog?category=${encodeURIComponent(catName)}">
          <div class="ico">${icon(CAT_ICON[catName] || "cap")}</div>
          <h3>${esc(catName)}</h3>
          <div class="c">${courses.filter((c) => c.category === catName).length} courses</div>
        </a>`).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head reveal"><div><span class="eyebrow">Trending</span><h2 style="margin-top:10px">Most popular courses</h2><p class="section-sub">What learners are taking right now.</p></div><a class="btn btn-outline btn-sm" href="#/catalog">View all ${icon("arrow")}</a></div>
      <div class="grid">${popular.map(courseCard).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head reveal"><div><span class="eyebrow">How it works</span><h2 style="margin-top:10px">Start learning in three steps</h2></div></div>
      <div class="cols-3">
        <div class="card feature reveal"><div class="step-num">1</div><h3>Choose a plan</h3><p>Pick Basic, Pro or Premium — billed monthly, cancel anytime.</p></div>
        <div class="card feature reveal"><div class="step-num">2</div><h3>Start learning</h3><p>Stream lessons, track your progress, and resume right where you left off.</p></div>
        <div class="card feature reveal"><div class="step-num">3</div><h3>Earn a certificate</h3><p>Complete a course and showcase the skill you just built.</p></div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head reveal"><div><span class="eyebrow">Members</span><h2 style="margin-top:10px">Loved by learners</h2></div></div>
      <div class="cols-3">${testimonials.map(([n, role, st, q]) => `
        <div class="card quote reveal">
          <div class="stars-row">${"★".repeat(st)}</div>
          <p>${esc(q)}</p>
          <div class="who"><div class="av">${esc(n[0])}</div><div><div class="nm">${esc(n)}</div><div class="rl">${esc(role)}</div></div></div>
        </div>`).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head reveal"><div><span class="eyebrow">FAQ</span><h2 style="margin-top:10px">Questions, answered</h2></div></div>
      <div class="faq reveal">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
    </section>

    <section class="section container"><div class="cta-band reveal">
      <span class="eyebrow" style="justify-content:center">Get started</span>
      <h2 style="margin-top:14px">Start learning today</h2>
      <p>Join ${fmtNum(totalStudents)}+ learners building real, in-demand skills on CourseHub.</p>
      <div class="row" style="justify-content:center"><a class="btn btn-primary btn-lg" href="#/register">Create free account</a><a class="btn btn-outline btn-lg" href="#/catalog">Browse courses</a></div>
    </div></section>`;
}

async function viewCatalog() {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const filters = { search: params.get("q") || "", category: params.get("category") || "", tier: params.get("tier") || "" };
  app.innerHTML = `<div class="container section"><div class="center"><div class="spinner"></div></div></div>`;
  const [courses, allCats] = await Promise.all([
    getCourses(filters),
    getCourses().then((cs) => [...new Set(cs.map((c) => c.category).filter(Boolean))]),
  ]);
  app.innerHTML = `
    <section class="container section">
      <div class="reveal">
        <span class="eyebrow">Catalog</span>
        <h2 style="font-size:clamp(30px,4.5vw,44px);margin:12px 0 6px">Find your next course</h2>
        <p class="section-sub">${courses.length} course${courses.length === 1 ? "" : "s"} across ${allCats.length} categories — preview any of them free.</p>
      </div>
      <div class="filters reveal">
        <div style="position:relative;flex:1;min-width:240px">
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted-2);display:flex">${icon("search")}</span>
          <input class="input" id="f-q" placeholder="Search courses…" value="${esc(filters.search)}" style="padding-left:42px" />
        </div>
        <select class="input" id="f-cat" style="max-width:200px"><option value="">All categories</option>${allCats.map((c) => `<option ${c === filters.category ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
        <select class="input" id="f-tier" style="max-width:160px"><option value="">All plans</option>${["free", "basic", "pro", "premium"].map((t) => `<option value="${t}" ${t === filters.tier ? "selected" : ""}>${cap(t)}</option>`).join("")}</select>
      </div>
      <div class="grid">${courses.map(courseCard).join("") || `<div class="card pad muted">No courses match these filters. <a class="gold" href="#/catalog">Clear filters</a></div>`}</div>
    </section>`;
  const apply = () => {
    const p = new URLSearchParams();
    const q = document.getElementById("f-q").value.trim(); if (q) p.set("q", q);
    const cat = document.getElementById("f-cat").value; if (cat) p.set("category", cat);
    const t = document.getElementById("f-tier").value; if (t) p.set("tier", t);
    location.hash = "#/catalog" + (p.toString() ? "?" + p.toString() : "");
  };
  document.getElementById("f-cat").onchange = apply;
  document.getElementById("f-tier").onchange = apply;
  document.getElementById("f-q").onkeydown = (e) => { if (e.key === "Enter") apply(); };
}

async function viewCourse(m) {
  const slug = decodeURIComponent(m[1].split("?")[0]);
  const course = await getCourse(slug);
  if (!course) { app.innerHTML = `<div class="container section"><h2>Course not found</h2><a class="btn btn-outline" href="#/catalog" style="margin-top:16px">Back to catalog</a></div>`; return; }
  const modules = await getCurriculum(course.id);
  const hasAccess = TIER_RANK[tier] >= TIER_RANK[course.required_tier];
  const allLessons = modules.flatMap((x) => x.lessons);
  const totalDur = allLessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);
  const outcomes = Array.isArray(course.learning_outcomes) ? course.learning_outcomes : [];
  const lessonRow = (l) => {
    const unlocked = l.is_preview || hasAccess;
    return `<div class="lesson-row ${unlocked ? "clickable" : ""}" ${unlocked ? `onclick="location.hash='#/lesson/${l.id}'"` : ""}>
      <span class="ico">${unlocked ? icon("play") : icon("lock")}</span>
      <span class="t">${esc(l.title)} ${l.is_preview ? `<span class="label gold" style="margin-left:6px">Preview</span>` : ""}</span>
      <span class="dur">${fmtDur(l.duration_seconds)}</span></div>`;
  };
  app.innerHTML = `
    <div class="container">
      <div class="detail-hero reveal">
        <div class="detail-cover"><img src="${esc(course.image_url || "")}" alt="${esc(course.title)}" /></div>
      </div>
      <div class="detail-grid">
        <div class="reveal">
          <div class="row">${tierBadge(course.required_tier)}${course.category ? `<span class="label">${esc(course.category)}</span>` : ""}${course.level ? `<span class="label">${esc(course.level)}</span>` : ""}</div>
          <h1>${esc(course.title)}</h1>
          <p class="muted" style="font-size:18px;margin:8px 0">${esc(course.subtitle || "")}</p>
          <div class="rating-row">
            ${course.rating ? `<span class="big">★ ${course.rating}</span><span>(${fmtNum(course.rating_count)} ratings)</span><span class="dot" style="width:3px;height:3px;border-radius:50%;background:var(--border-2)"></span>` : ""}
            <span>${fmtNum(course.students_count)} learners</span><span>·</span>
            <span>${allLessons.length} lessons</span><span>·</span><span>${fmtDur(totalDur)}</span>
          </div>
          <p class="muted" style="font-size:13.5px;margin-top:8px">Created by <span class="gold">${esc(course.creator_name || "")}</span></p>

          ${outcomes.length ? `<div class="outcomes"><h2 style="font-size:21px;margin-bottom:18px">What you'll learn</h2><ul class="learn-grid">${outcomes.map((o) => `<li>${icon("check")}<span>${esc(String(o))}</span></li>`).join("")}</ul></div>` : ""}

          <h2 style="margin:32px 0 10px;font-size:24px">About this course</h2>
          <p class="prose">${esc(course.description || "")}</p>

          <h2 style="margin:32px 0 6px;font-size:24px">Curriculum</h2>
          <p class="muted" style="font-size:13.5px;margin:0 0 16px">${modules.length} section${modules.length === 1 ? "" : "s"} · ${allLessons.length} lessons · ${fmtDur(totalDur)} total</p>
          ${modules.map((mod) => `<div class="module"><p class="module-title">${esc(mod.title)}</p>${mod.lessons.map(lessonRow).join("")}</div>`).join("") || `<p class="muted">No lessons yet.</p>`}
        </div>

        <aside class="reveal">
          <div class="enroll-card">
            ${hasAccess
              ? `<div class="row" style="gap:8px"><span class="label gold">${icon("check")} Enrolled</span></div>
                 <p class="muted" style="margin:0;font-size:14px">Your ${esc(cap(tier))} plan covers this course.</p>
                 <a class="btn btn-primary" style="width:100%" href="#/learn/${esc(course.slug)}">Start learning ${icon("arrow")}</a>`
              : `<div class="price-tag">${cap(course.required_tier)} plan</div>
                 <p class="muted" style="margin:0;font-size:14px">Subscribe to unlock the full course. Preview lessons are free.</p>
                 <a class="btn btn-primary" style="width:100%" href="#/pricing">View plans</a>
                 ${session ? "" : `<a class="btn btn-outline" style="width:100%" href="#/login">Log in</a>`}`}
            <hr class="divider" />
            <strong style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-2)">This course includes</strong>
            <ul class="includes">
              <li>${icon("film")} ${allLessons.length} on-demand lessons</li>
              <li>${icon("clock")} ${fmtDur(totalDur)} of content</li>
              <li>${icon("monitor")} Access on any device</li>
              <li>${icon("infinity")} Full access while subscribed</li>
              ${course.required_tier === "premium" ? `<li>${icon("award")} Certificate of completion</li>` : ""}
            </ul>
          </div>
        </aside>
      </div>
    </div>`;
}

// Resume router: /learn/:slug -> jump to the next incomplete (accessible) lesson.
async function viewLearn(m) {
  const slug = decodeURIComponent(m[1].split("?")[0]);
  const course = await getCourse(slug);
  if (!course) { go("#/catalog"); return; }
  const lessons = (await getCurriculum(course.id)).flatMap((x) => x.lessons);
  const hasAccess = TIER_RANK[tier] >= TIER_RANK[course.required_tier];
  const accessible = lessons.filter((l) => l.is_preview || hasAccess);
  if (!accessible.length) { go("#/course/" + slug); return; }
  let target = accessible[0];
  if (session) {
    const { data: prog } = await supabase.from("lesson_progress").select("lesson_id, completed").eq("course_id", course.id).eq("user_id", session.user.id);
    const done = new Set((prog || []).filter((p) => p.completed).map((p) => p.lesson_id));
    target = accessible.find((l) => !done.has(l.id)) || accessible[accessible.length - 1];
  }
  go("#/lesson/" + target.id);
}

async function viewLesson(m) {
  const lessonId = decodeURIComponent(m[1]);
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) { app.innerHTML = `<div class="container section"><h2>Lesson not found</h2></div>`; return; }
  const course = await getCourse((await supabase.from("courses").select("slug").eq("id", lesson.course_id).maybeSingle()).data?.slug || "");
  const modules = course ? await getCurriculum(course.id) : [];
  const flat = modules.flatMap((mod) => mod.lessons);
  const idx = flat.findIndex((l) => l.id === lessonId);
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const prev = idx > 0 ? flat[idx - 1] : null;
  // THE GATE: lesson_content is returned by RLS only if preview / owned / entitled.
  const { data: content } = await supabase.from("lesson_content").select("content_html, cf_stream_uid, video_url").eq("lesson_id", lessonId).maybeSingle();
  const unlocked = !!content;
  const ytId = unlocked ? parseYouTube(content.video_url) : null;
  const hasSampleVideo = unlocked && !ytId && !!content.cf_stream_uid;

  let myProg = null, coursePct = 0, doneSet = new Set();
  if (session) {
    const [{ data: pr }, { data: cp }, { data: all }] = await Promise.all([
      supabase.from("lesson_progress").select("*").eq("user_id", session.user.id).eq("lesson_id", lessonId).maybeSingle(),
      supabase.rpc("my_course_progress", { p_course_id: lesson.course_id }),
      supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", session.user.id).eq("course_id", lesson.course_id),
    ]);
    myProg = pr; coursePct = cp?.[0]?.percent ?? 0;
    doneSet = new Set((all || []).filter((p) => p.completed).map((p) => p.lesson_id));
    supabase.from("enrollments").upsert({ user_id: session.user.id, course_id: lesson.course_id, last_accessed_at: new Date().toISOString() }, { onConflict: "user_id,course_id" });
  }
  const alreadyDone = !!myProg?.completed;
  const courseDone = coursePct >= 100;

  const side = flat.map((l) => {
    const ok = l.is_preview || TIER_RANK[tier] >= TIER_RANK[course?.required_tier || "basic"];
    const isDone = doneSet.has(l.id);
    const mark = isDone ? icon("check", 'width="13" height="13"') : ok ? (l.id === lessonId ? icon("play", 'width="13" height="13"') : "○") : icon("lock", 'width="12" height="12"');
    return `<div class="side-lesson ${l.id === lessonId ? "active" : ""} ${ok ? "" : "locked"}" onclick="location.hash='#/lesson/${l.id}'">
      <span style="width:16px;display:flex;justify-content:center;color:${isDone ? "var(--gold)" : "inherit"}">${mark}</span>
      <span style="flex:1">${esc(l.title)}</span></div>`;
  }).join("");

  app.innerHTML = `
    <div class="container learn">
      <aside class="sidebar reveal">
        <div class="head">
          <a class="muted" style="font-size:13px" href="#/course/${esc(course?.slug || "")}">← ${esc(course?.title || "Course")}</a>
          ${session ? `<div style="height:5px;background:var(--surface);border-radius:99px;overflow:hidden;margin-top:12px"><div style="height:100%;width:${coursePct}%;background:var(--gold)"></div></div><div class="muted" style="font-size:12px;margin-top:6px">${coursePct}% complete</div>` : ""}
        </div>
        <div>${side}</div>
      </aside>
      <div class="reveal">
        <h1 style="font-size:28px;margin:0 0 16px">${esc(lesson.title)}</h1>
        ${unlocked
          ? `${ytId
                ? `<iframe class="player" src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1" title="${esc(lesson.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`
                : hasSampleVideo
                  ? `<video id="player" class="player" controls playsinline></video>`
                  : ""}
             <div class="prose" style="margin-top:24px">${content.content_html || ""}</div>
             <div class="row" style="margin-top:24px;justify-content:space-between">
               <div class="row"><button class="btn ${alreadyDone ? "btn-outline" : "btn-primary"}" id="complete">${alreadyDone ? "Completed ✓" : icon("check") + " Mark complete"}</button><span class="muted" id="complete-msg" style="font-size:14px"></span></div>
               <div class="row">${prev ? `<a class="btn btn-ghost btn-sm" href="#/lesson/${prev.id}">← Previous</a>` : ""}${next ? `<a class="btn btn-outline btn-sm" href="#/lesson/${next.id}">Next lesson →</a>` : ""}</div>
             </div>
             ${courseDone ? `<div class="card pad" style="margin-top:24px;border-color:var(--gold-line);background:var(--gold-soft);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
               <div class="row" style="gap:12px"><span style="color:var(--gold);display:flex">${icon("award", 'width="22" height="22"')}</span><div><strong>You finished this course!</strong><div class="muted" style="font-size:13px">${tier === "premium" ? "Claim your certificate of completion." : "Upgrade to Premium to earn a certificate."}</div></div></div>
               ${tier === "premium" ? `<button class="btn btn-primary btn-sm" id="claim-cert">Claim certificate</button>` : `<a class="btn btn-outline btn-sm" href="#/pricing">Go Premium</a>`}</div>` : ""}`
          : `<div class="locked-box">
               <div class="lk">${icon("lock", 'width="24" height="24"')}</div>
               <h2 style="margin:0;font-size:23px">This lesson is locked</h2>
               <p class="muted" style="margin:0;max-width:42ch">Your current plan (${esc(cap(tier))}) doesn't include this lesson. Upgrade to watch the full course.</p>
               <div class="row" style="justify-content:center">${session ? "" : `<a class="btn btn-outline" href="#/login">Log in</a>`}<a class="btn btn-primary" href="#/pricing">View plans</a></div>
             </div>`}
      </div>
    </div>`;

  if (unlocked) {
    const v = document.getElementById("player"); // null for a YouTube embed
    if (v) {
      if (window.Hls && window.Hls.isSupported()) { const hls = new window.Hls(); hls.loadSource(SAMPLE_HLS); hls.attachMedia(v); }
      else if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = SAMPLE_HLS; }
      const resumeAt = myProg?.last_position_seconds || 0;
      if (resumeAt > 3) v.addEventListener("loadedmetadata", () => { if (resumeAt < v.duration - 5) v.currentTime = resumeAt; }, { once: true });
      let lastSave = 0;
      const savePos = (sec) => { if (!session || !sec) return; supabase.from("lesson_progress").upsert({ user_id: session.user.id, lesson_id: lessonId, course_id: lesson.course_id, last_position_seconds: sec }, { onConflict: "user_id,lesson_id" }); };
      v.addEventListener("timeupdate", () => { const now = Date.now(); if (now - lastSave > 12000) { lastSave = now; savePos(Math.floor(v.currentTime)); } });
      v.addEventListener("pause", () => savePos(Math.floor(v.currentTime)));
      window.addEventListener("pagehide", () => savePos(Math.floor(v.currentTime)), { once: true });
    }
    const btn = document.getElementById("complete");
    if (btn) btn.onclick = async () => {
      if (!session) { go("#/login"); return; }
      btn.disabled = true;
      const { error } = await supabase.from("lesson_progress").upsert(
        { user_id: session.user.id, lesson_id: lessonId, course_id: lesson.course_id, completed: true, completed_at: new Date().toISOString(), last_position_seconds: Math.floor(v?.currentTime || 0) },
        { onConflict: "user_id,lesson_id" });
      if (error) { document.getElementById("complete-msg").textContent = "Could not save"; btn.disabled = false; return; }
      if (next) go("#/lesson/" + next.id); else router();
    };
    const cc = document.getElementById("claim-cert");
    if (cc) cc.onclick = async () => {
      cc.disabled = true; cc.textContent = "Issuing…";
      const { error } = await supabase.rpc("claim_certificate", { p_course_id: lesson.course_id });
      if (error) { cc.disabled = false; cc.textContent = "Claim certificate"; alert(error.message); return; }
      go("#/certificates");
    };
  }
}

function certificateCard(cert) {
  const c = cert.courses || {};
  const name = profile?.full_name || session?.user?.email || "Learner";
  const date = new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `<div class="cert reveal"><div class="cert-inner">
    <div class="cert-seal">${icon("award", 'width="30" height="30"')}</div>
    <div class="cert-eyebrow">Certificate of Completion</div>
    <p class="cert-pre">This certifies that</p>
    <div class="cert-name">${esc(name)}</div>
    <p class="cert-pre">has successfully completed</p>
    <div class="cert-course">${esc(c.title || "Course")}</div>
    <div class="cert-foot">
      <div><div class="cert-foot-l">Issued</div><div>${esc(date)}</div></div>
      <div><div class="cert-foot-l">Credential ID</div><div>${esc(cert.serial)}</div></div>
      <div><div class="cert-foot-l">Instructor</div><div>${esc(c.creator_name || "CourseHub")}</div></div>
    </div>
  </div></div>`;
}

async function viewCertificates() {
  if (!session) { go("#/login"); return; }
  const { data: certs } = await supabase.from("certificates").select("*, courses(title, slug, image_url, creator_name)").order("issued_at", { ascending: false });
  const list = certs || [];
  app.innerHTML = `
    <section class="container section">
      <div class="reveal"><span class="eyebrow">Achievements</span><h2 style="font-size:34px;margin:10px 0 6px">Your certificates</h2>
        <p class="section-sub">Certificates you've earned by completing courses on the Premium plan.</p></div>
      ${list.length
        ? `<div style="display:flex;flex-direction:column;gap:24px;max-width:780px;margin-top:8px">${list.map(certificateCard).join("")}</div>`
        : `<div class="card pad muted reveal" style="max-width:560px;margin-top:8px">You haven't earned a certificate yet. Finish a course on the Premium plan to earn one. <a class="gold" href="#/catalog">Browse courses ${icon("arrow", 'width="14" height="14"')}</a></div>`}
    </section>`;
}

function authForm(mode) {
  const isReg = mode === "register";
  app.innerHTML = `
    <div class="auth-split">
      <div class="auth-aside">
        <img src="${ASIDE_IMG}" alt="" />
        <div class="ov">
          <span class="eyebrow">CourseHub</span>
          <h2>${isReg ? "Start learning skills that compound." : "Welcome back to your courses."}</h2>
          <p class="muted">Join thousands of learners leveling up across development, design, data and business.</p>
        </div>
      </div>
      <div class="auth-form-wrap"><div class="auth-form">
        <h1>${isReg ? "Create your account" : "Log in"}</h1>
        <p class="muted" style="margin:6px 0 24px">${isReg ? "Start with free previews — no card required." : "Pick up right where you left off."}</p>
        <div id="auth-msg"></div>
        <form id="auth-form">
          ${isReg ? `<div class="field"><label>Full name</label><input class="input" name="full_name" required /></div>` : ""}
          <div class="field"><label>Email</label><input class="input" type="email" name="email" placeholder="you@example.com" required /></div>
          <div class="field"><label>Password</label><input class="input" type="password" name="password" placeholder="${isReg ? "At least 10 characters" : "Your password"}" minlength="${isReg ? 10 : 1}" required /></div>
          <button class="btn btn-primary btn-lg" style="width:100%" id="submit">${isReg ? "Create account" : "Log in"}</button>
        </form>
        <p class="muted" style="font-size:14px;margin-top:18px">
          ${isReg ? `Already have an account? <a class="gold" href="#/login">Log in</a>` : `New to CourseHub? <a class="gold" href="#/register">Create an account</a>`}
        </p>
      </div></div>
    </div>`;
  const msg = document.getElementById("auth-msg");
  const setMsg = (t, kind = "danger") => (msg.innerHTML = `<div class="alert ${kind}">${esc(t)}</div>`);
  document.getElementById("auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById("submit"); btn.disabled = true; msg.innerHTML = "";
    const f = new FormData(e.target);
    const email = f.get("email"), password = f.get("password");
    try {
      if (isReg) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: f.get("full_name") } },
        });
        if (error) throw error;
        // Accounts are auto-confirmed, so sign in immediately for a smooth flow.
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) { setMsg("Account created — you can now log in.", "success"); btn.disabled = false; return; }
        await loadSession(); renderNav(); go("#/dashboard"); router(); return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadSession(); renderNav(); go("#/dashboard"); router(); return;
      }
    } catch (err) {
      setMsg(err.message || "Something went wrong.");
    } finally { btn.disabled = false; }
  };
}
const viewLogin = () => authForm("login");
const viewRegister = () => authForm("register");

async function viewDashboard() {
  if (!session) { go("#/login"); return; }
  app.innerHTML = `<div class="container section"><div class="center"><div class="spinner"></div></div></div>`;
  const { data: enrolls } = await supabase.from("enrollments").select("course_id, courses(*)").order("last_accessed_at", { ascending: false });
  const enrolled = (enrolls || []).map((e) => e.courses).filter(Boolean);
  const prog = {};
  await Promise.all(enrolled.map(async (c) => {
    const { data } = await supabase.rpc("my_course_progress", { p_course_id: c.id });
    prog[c.id] = data?.[0]?.percent ?? 0;
  }));
  const recommended = (await getCourses()).filter((c) => !enrolled.find((e) => e.id === c.id)).slice(0, 3);
  const progressCard = (c) => `
    <article class="course-card reveal" onclick="location.hash='#/learn/${esc(c.slug)}'">
      <div class="thumb"><img src="${esc(c.image_url || "")}" alt="${esc(c.title)}" loading="lazy" /><div class="labels">${tierBadge(c.required_tier)}</div></div>
      <div class="body">
        <h3>${esc(c.title)}</h3>
        <div style="height:6px;background:var(--surface);border-radius:99px;overflow:hidden;margin-top:4px"><div style="height:100%;width:${prog[c.id]}%;background:var(--gold)"></div></div>
        <div class="course-meta"><span>${prog[c.id]}% complete</span><span class="dot"></span><span class="gold">Resume ${icon("arrow", 'width="14" height="14"')}</span></div>
      </div>
    </article>`;
  app.innerHTML = `
    <section class="container section">
      <div class="reveal"><span class="eyebrow">Your dashboard</span>
        <h2 style="font-size:36px;margin:10px 0 4px">Welcome back${profile?.full_name ? ", " + esc(profile.full_name.split(" ")[0]) : ""}.</h2>
        <p class="section-sub">You're on the ${tierBadge(tier)} plan.</p>
        <div class="row" style="margin-top:18px"><a class="btn btn-outline btn-sm" href="#/catalog">Browse catalog</a><a class="btn btn-ghost btn-sm" href="#/certificates">${icon("award", 'width="15" height="15"')} Certificates</a><a class="btn btn-ghost btn-sm" href="#/pricing">Manage plan</a></div></div>
      <h3 style="font-family:var(--serif);font-size:24px;margin:34px 0 18px" class="reveal">Continue learning</h3>
      <div class="grid">${enrolled.map(progressCard).join("") || `<div class="card pad muted reveal">You haven't started a course yet. <a class="gold" href="#/catalog">Browse the catalog ${icon("arrow", 'width="14" height="14"')}</a></div>`}</div>
      <h3 style="font-family:var(--serif);font-size:24px;margin:42px 0 18px" class="reveal">Recommended for you</h3>
      <div class="grid">${recommended.map(courseCard).join("")}</div>
    </section>`;
}

async function viewAccount() {
  if (!session) { go("#/login"); return; }
  app.innerHTML = `
    <section class="container section">
      <div class="reveal"><span class="eyebrow">Account</span><h2 style="font-size:36px;margin:10px 0 24px">Your account</h2></div>
      <div class="cols-3" style="max-width:780px">
        <div class="card pad stack reveal" style="grid-column:span 2">
          <h3 style="font-size:20px;margin:0">Profile</h3>
          <div class="field" style="margin:6px 0 0"><label>Full name</label><input class="input" id="acc-name" value="${esc(profile?.full_name || "")}" /></div>
          <div class="field" style="margin:0"><label>Email</label><input class="input" value="${esc(session.user.email)}" disabled /></div>
          <div class="row" style="gap:8px"><span class="muted" style="font-size:13px">Role</span><span class="label">${esc(profile?.role || "subscriber")}</span></div>
          <div class="row"><button class="btn btn-primary btn-sm" id="acc-save">Save changes</button><span class="muted" id="acc-msg" style="font-size:13px"></span></div>
        </div>
        <div class="card pad stack reveal">
          <h3 style="font-size:20px;margin:0">Membership</h3>
          <div class="price-tag">${tierBadge(tier)}</div>
          <p class="muted" style="margin:0;font-size:14px">Manage your plan and access to courses.</p>
          <a class="btn btn-outline btn-sm" href="#/pricing">Change plan</a>
        </div>
      </div>
    </section>`;
  const saveBtn = document.getElementById("acc-save");
  if (saveBtn) saveBtn.onclick = async () => {
    const name = document.getElementById("acc-name").value;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", session.user.id);
    document.getElementById("acc-msg").textContent = error ? error.message : "Saved ✓";
    if (!error && profile) { profile.full_name = name; renderNav(); }
  };
}

function viewPricing() {
  app.innerHTML = `
    <section class="container section">
      <div class="reveal" style="text-align:center;max-width:620px;margin:0 auto 40px">
        <span class="eyebrow" style="justify-content:center">Pricing</span>
        <h2 style="font-size:clamp(32px,4.5vw,48px);margin:14px 0 8px">One membership. The whole library.</h2>
        <p class="section-sub" style="margin:0 auto">Upgrade any time — higher tiers unlock more of the catalog and better video. Cancel whenever.</p>
      </div>
      <div class="tiers">
        ${TIERS.map((t) => `
          <div class="card tier reveal ${t.highlight ? "highlight" : ""}">
            ${t.highlight ? `<span class="label gold" style="align-self:flex-start">Most popular</span>` : ""}
            <div><div class="nm">${t.name}</div><div class="muted" style="font-size:13px">${t.blurb}</div></div>
            <div class="pr">${t.price === 0 ? "Free" : "$" + t.price}<small>${t.price ? " /month" : ""}</small></div>
            <ul>${t.features.map((f) => `<li>${icon("check")}<span>${esc(f)}</span></li>`).join("")}</ul>
            <div style="margin-top:auto">${tier === t.id
              ? `<button class="btn btn-outline" style="width:100%" disabled>Current plan</button>`
              : `<a class="btn ${t.highlight ? "btn-primary" : "btn-outline"}" style="width:100%" href="${session ? "#/account" : "#/register"}">${t.price ? "Choose " + t.name : "Get started free"}</a>`}</div>
          </div>`).join("")}
      </div>
      <p class="muted reveal" style="font-size:13px;margin-top:22px;text-align:center">All plans are billed monthly and you can cancel anytime. Prices in USD.</p>
    </section>`;
}

/* ---------------- creator studio ---------------- */
async function viewCreator() {
  if (!(await requireRole(["creator", "admin"]))) return;
  const { data: courses } = await supabase.from("courses").select("*").eq("creator_id", session.user.id).order("created_at", { ascending: false });
  app.innerHTML = `
    <section class="container section">
      <div class="section-head reveal"><div><span class="eyebrow">Studio</span><h2 style="margin-top:10px">Your courses</h2></div>
        <a class="btn btn-primary" href="#/creator/course/new">+ New course</a></div>
      <div class="grid">${(courses || []).map((c) => `
        <article class="course-card reveal" onclick="location.hash='#/creator/course/${c.id}'">
          ${c.image_url ? `<div class="thumb"><img src="${esc(c.image_url)}" alt="" loading="lazy" /><div class="labels">${tierBadge(c.required_tier)}${statusLabel(c.status)}</div></div>` : ""}
          <div class="body"><h3>${esc(c.title)}</h3><p class="sub">${esc(c.subtitle || "")}</p>
            ${!c.image_url ? `<div class="row" style="margin-top:6px">${tierBadge(c.required_tier)}${statusLabel(c.status)}</div>` : ""}</div>
        </article>`).join("") || `<div class="card pad muted">No courses yet — create your first one.</div>`}</div>
    </section>`;
}

async function viewCreatorNew() {
  if (!(await requireRole(["creator", "admin"]))) return;
  app.innerHTML = `
    <section class="container section"><div class="card pad" style="max-width:600px;margin:10px auto">
      <a class="muted" href="#/creator" style="font-size:13px">← Studio</a>
      <h2 style="margin:8px 0 16px;font-size:26px">New course</h2><div id="msg"></div>
      <form id="cform">
        <div class="field"><label>Title</label><input class="input" name="title" required /></div>
        <div class="field"><label>Subtitle</label><input class="input" name="subtitle" /></div>
        <div class="field"><label>Description</label><textarea class="input" name="description" rows="3"></textarea></div>
        <div class="field"><label>Cover image URL (optional)</label><input class="input" name="image_url" placeholder="https://…" /></div>
        <div class="row" style="gap:12px;align-items:flex-end">
          <div class="field" style="flex:1;margin:0"><label>Category</label><input class="input" name="category" placeholder="Development" /></div>
          <div class="field" style="margin:0"><label>Level</label><select class="input" name="level"><option value="">—</option><option>beginner</option><option>intermediate</option><option>advanced</option></select></div>
          <div class="field" style="margin:0"><label>Required tier</label><select class="input" name="required_tier"><option>basic</option><option>pro</option><option>premium</option></select></div>
        </div>
        <button class="btn btn-primary btn-lg" style="width:100%;margin-top:8px">Create course</button>
      </form></div></section>`;
  document.getElementById("cform").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get("title");
    const slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase.from("courses").insert({
      creator_id: session.user.id, creator_name: profile?.full_name || null, title, slug,
      subtitle: f.get("subtitle") || null, description: f.get("description") || null,
      image_url: f.get("image_url") || null, category: f.get("category") || null,
      level: f.get("level") || null, required_tier: f.get("required_tier") || "basic", status: "draft",
    }).select().maybeSingle();
    if (error) { document.getElementById("msg").innerHTML = `<div class="alert danger">${esc(error.message)}</div>`; return; }
    go("#/creator/course/" + data.id);
  };
}

async function viewCreatorCourse(m) {
  if (!(await requireRole(["creator", "admin"]))) return;
  const id = decodeURIComponent(m[1]);
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) { app.innerHTML = `<div class="container section"><h2>Course not found</h2></div>`; return; }
  const modules = await getCurriculum(id);
  app.innerHTML = `
    <section class="container section">
      <a class="muted" href="#/creator" style="font-size:13px">← Studio</a>
      <div class="section-head" style="margin-top:8px"><h2 style="margin:0">${esc(course.title)}</h2>
        <button class="btn ${course.status === "published" ? "btn-outline" : "btn-primary"}" id="pub">${course.status === "published" ? "Unpublish" : "Publish"}</button></div>
      <div class="card pad row" style="margin-bottom:18px">${tierBadge(course.required_tier)}${statusLabel(course.status)}<span class="muted" style="font-size:13px">${esc(course.subtitle || "")}</span></div>
      <h3 style="font-family:var(--serif);font-size:21px">Curriculum</h3>
      <div style="margin:14px 0">${modules.map((mod) => `
        <div class="card pad" style="margin-bottom:12px">
          <strong>${esc(mod.title)}</strong>
          <div style="margin-top:10px">${mod.lessons.map((l) => `
            <div class="lesson-row" style="border:1px solid var(--border);border-radius:9px;margin-bottom:8px"><span class="t">${esc(l.title)} ${l.is_preview ? '<span class="label gold">preview</span>' : ""} ${tierBadge(l.required_tier || course.required_tier)}</span>
              <button class="btn btn-ghost btn-sm edit-lesson" data-id="${l.id}">Edit</button></div>`).join("") || '<span class="muted" style="font-size:13px">No lessons yet</span>'}</div>
          <div class="row" style="margin-top:10px;gap:8px"><input class="input new-lesson-inp" data-mod="${mod.id}" placeholder="New lesson title…" style="max-width:260px;height:38px" /><button class="btn btn-outline btn-sm add-lesson" data-mod="${mod.id}">+ Add lesson</button></div>
        </div>`).join("")}</div>
      <div class="row" style="gap:8px;margin-top:6px"><input class="input" id="new-mod" placeholder="New module title…" style="max-width:300px" /><button class="btn btn-outline" id="add-mod">+ Add module</button></div>
      <div id="lesson-editor"></div>
    </section>`;
  document.getElementById("pub").onclick = async () => {
    const next = course.status === "published" ? "draft" : "published";
    await supabase.from("courses").update({ status: next, published_at: next === "published" ? new Date().toISOString() : course.published_at }).eq("id", id);
    router();
  };
  document.getElementById("add-mod").onclick = async () => {
    const inp = document.getElementById("new-mod");
    const title = inp.value.trim(); if (!title) { inp.focus(); return; }
    const { error } = await supabase.from("modules").insert({ course_id: id, title, position: modules.length });
    if (error) { alert(error.message); return; }
    router();
  };
  document.getElementById("new-mod").onkeydown = (e) => { if (e.key === "Enter") document.getElementById("add-mod").click(); };
  document.querySelectorAll(".add-lesson").forEach((b) => (b.onclick = async () => {
    const inp = document.querySelector(`.new-lesson-inp[data-mod="${b.dataset.mod}"]`);
    const title = inp.value.trim(); if (!title) { inp.focus(); return; }
    const mod = modules.find((x) => x.id === b.dataset.mod);
    const { error } = await supabase.from("lessons").insert({ module_id: b.dataset.mod, course_id: id, title, position: mod ? mod.lessons.length : 0 });
    if (error) { alert(error.message); return; }
    router();
  }));
  document.querySelectorAll(".new-lesson-inp").forEach((inp) => (inp.onkeydown = (e) => { if (e.key === "Enter") document.querySelector(`.add-lesson[data-mod="${inp.dataset.mod}"]`).click(); }));
  document.querySelectorAll(".edit-lesson").forEach((b) => (b.onclick = () => openLessonEditor(b.dataset.id)));
}

async function openLessonEditor(lessonId) {
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  const { data: content } = await supabase.from("lesson_content").select("*").eq("lesson_id", lessonId).maybeSingle();
  const ed = document.getElementById("lesson-editor");
  ed.innerHTML = `<div class="card pad stack" style="margin-top:16px;border-color:var(--border-2)">
    <h3 style="margin:0;font-size:19px">Edit lesson</h3><div id="led-msg"></div>
    <div class="field" style="margin:0"><label>Title</label><input class="input" id="l-title" value="${esc(lesson.title)}" /></div>
    <div class="row" style="gap:18px">
      <label class="row" style="gap:6px;font-size:14px"><input type="checkbox" id="l-prev" ${lesson.is_preview ? "checked" : ""} /> Free preview</label>
      <div class="field" style="margin:0"><label>Required tier</label><select class="input" id="l-tier"><option value="">inherit course</option>${["basic", "pro", "premium"].map((t) => `<option ${lesson.required_tier === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
    </div>
    <div class="field" style="margin:0"><label>YouTube video URL</label><input class="input" id="l-yt" value="${esc(content?.video_url || "")}" placeholder="https://youtu.be/…  (Unlisted works)" /><span class="muted" style="font-size:12px;margin-top:4px">Upload your lesson to YouTube as <b>Unlisted</b>, then paste the link. Leave blank for a text-only lesson.</span></div>
    <div class="field" style="margin:0"><label>Lesson content</label><textarea class="input" id="l-html" rows="5">${esc(content?.content_html || "")}</textarea></div>
    <div class="row"><button class="btn btn-primary" id="l-save">Save lesson</button><button class="btn btn-danger" id="l-del">Delete</button></div>
  </div>`;
  wireLabels();
  ed.scrollIntoView({ behavior: "smooth" });
  document.getElementById("l-save").onclick = async () => {
    const yt = document.getElementById("l-yt").value.trim();
    if (yt && !parseYouTube(yt)) { document.getElementById("led-msg").innerHTML = `<div class="alert danger">That doesn't look like a valid YouTube link.</div>`; return; }
    const hasVid = !!parseYouTube(yt) || !!content?.cf_stream_uid;
    const e1 = await supabase.from("lessons").update({
      title: document.getElementById("l-title").value,
      is_preview: document.getElementById("l-prev").checked,
      required_tier: document.getElementById("l-tier").value || null,
      has_video: hasVid,
    }).eq("id", lessonId);
    const e2 = await supabase.from("lesson_content").upsert({
      lesson_id: lessonId,
      content_html: sanitize(document.getElementById("l-html").value),
      cf_stream_uid: content?.cf_stream_uid ?? null,
      video_url: yt || null,
    }, { onConflict: "lesson_id" });
    document.getElementById("led-msg").innerHTML = (e1.error || e2.error)
      ? `<div class="alert danger">${esc((e1.error || e2.error).message)}</div>`
      : `<div class="alert success">Saved ✓</div>`;
  };
  document.getElementById("l-del").onclick = async () => {
    if (!confirm("Delete this lesson?")) return;
    await supabase.from("lessons").delete().eq("id", lessonId);
    router();
  };
}

/* ---------------- admin ---------------- */
async function viewAdmin() {
  if (!(await requireRole(["admin"]))) return;
  app.innerHTML = `<div class="container section"><div class="center"><div class="spinner"></div></div></div>`;
  const [subs, users, courses] = await Promise.all([
    supabase.from("subscriptions").select("tier,status,billing_interval"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id,status"),
  ]);
  const active = (subs.data || []).filter((s) => ["active", "trialing"].includes(s.status));
  const PRICE = { basic: 12, pro: 29, premium: 59 };
  const mrr = active.reduce((n, s) => n + (PRICE[s.tier] || 0), 0);
  const published = (courses.data || []).filter((c) => c.status === "published").length;
  const stat = (l, v) => `<div class="card stat-card reveal"><div class="l">${l}</div><div class="v">${v}</div></div>`;
  app.innerHTML = `
    <section class="container section">
      <div class="reveal"><span class="eyebrow">Admin</span><h2 style="font-size:34px;margin:10px 0 24px">Platform overview</h2></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">
        ${stat("Active subscriptions", active.length)}${stat("Est. MRR", "$" + mrr)}
        ${stat("Total users", users.count ?? "—")}${stat("Published courses", published)}</div>
      <div class="row reveal" style="margin-top:26px">
        <a class="btn btn-outline" href="#/admin/users">Manage users</a>
        <a class="btn btn-outline" href="#/admin/courses">All courses</a>
        <a class="btn btn-outline" href="#/admin/subscriptions">Subscriptions</a></div>
    </section>`;
}

async function viewAdminUsers() {
  if (!(await requireRole(["admin"]))) return;
  const { data: users } = await supabase.from("profiles").select("*").order("created_at");
  app.innerHTML = `
    <section class="container section">
      <a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2 style="margin:8px 0 20px">Users</h2>
      <div class="card pad reveal"><table class="dtable"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
        ${(users || []).map((u) => `<tr><td>${esc(u.full_name || "—")}</td><td class="muted">${esc(u.email || "")}</td>
          <td><select class="input role-sel" data-id="${u.id}" style="padding:6px 10px" ${u.id === session.user.id ? "disabled" : ""}>
            ${["subscriber", "creator", "admin"].map((r) => `<option ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
  document.querySelectorAll(".role-sel").forEach((s) => (s.onchange = async () => {
    const { error } = await supabase.from("profiles").update({ role: s.value }).eq("id", s.dataset.id);
    if (error) alert(error.message);
  }));
}

async function viewAdminCourses() {
  if (!(await requireRole(["admin"]))) return;
  const { data: courses } = await supabase.from("courses").select("*").order("students_count", { ascending: false });
  app.innerHTML = `
    <section class="container section"><a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2 style="margin:8px 0 20px">All courses</h2>
      <div class="card pad reveal"><table class="dtable"><thead><tr><th>Course</th><th>Tier</th><th>Status</th><th>Learners</th><th>Instructor</th></tr></thead><tbody>
        ${(courses || []).map((c) => `<tr><td>${esc(c.title)}</td><td>${tierBadge(c.required_tier)}</td><td>${statusLabel(c.status)}</td><td>${fmtNum(c.students_count)}</td><td class="muted">${esc(c.creator_name || "")}</td></tr>`).join("")}
      </tbody></table></div>
    </section>`;
}

async function viewAdminSubs() {
  if (!(await requireRole(["admin"]))) return;
  const { data: subs } = await supabase.from("subscriptions").select("*");
  app.innerHTML = `
    <section class="container section"><a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2 style="margin:8px 0 20px">Subscriptions</h2>
      <div class="card pad reveal"><table class="dtable"><thead><tr><th>Tier</th><th>Status</th><th>Renews</th></tr></thead><tbody>
        ${(subs || []).map((s) => `<tr><td>${tierBadge(s.tier)}</td><td>${statusLabel(s.status === "active" ? "published" : s.status)} ${s.cancel_at_period_end ? '<span class="label">cancels</span>' : ""}</td><td class="muted">${s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td></tr>`).join("") || '<tr><td class="muted">No subscriptions</td></tr>'}
      </tbody></table></div>
    </section>`;
}

/* ---------------- router ---------------- */
const routes = [
  [/^#?\/?$/, viewHome],
  [/^#\/catalog/, viewCatalog],
  [/^#\/course\/(.+)$/, viewCourse],
  [/^#\/lesson\/(.+)$/, viewLesson],
  [/^#\/learn\/(.+)$/, viewLearn],
  [/^#\/login$/, viewLogin],
  [/^#\/register$/, viewRegister],
  [/^#\/dashboard$/, viewDashboard],
  [/^#\/account$/, viewAccount],
  [/^#\/certificates$/, viewCertificates],
  [/^#\/pricing$/, viewPricing],
  [/^#\/creator$/, viewCreator],
  [/^#\/creator\/course\/new$/, viewCreatorNew],
  [/^#\/creator\/course\/(.+)$/, viewCreatorCourse],
  [/^#\/admin$/, viewAdmin],
  [/^#\/admin\/users$/, viewAdminUsers],
  [/^#\/admin\/courses$/, viewAdminCourses],
  [/^#\/admin\/subscriptions$/, viewAdminSubs],
];

let _io;
function observeReveals() {
  if (!_io) {
    _io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("in"); _io.unobserve(en.target); }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
  }
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => _io.observe(el));
}

// Accessibility: programmatically associate every .field label with its control.
let _lblN = 0;
function wireLabels() {
  document.querySelectorAll(".field").forEach((fld) => {
    const lab = fld.querySelector("label");
    const ctl = fld.querySelector("input, select, textarea");
    if (lab && ctl) {
      if (!ctl.id) ctl.id = "ctl-" + ++_lblN;
      if (!lab.htmlFor) lab.htmlFor = ctl.id;
    }
  });
}

// Each navigation gets a monotonic id; renders run concurrently (no head-of-line
// blocking, so a stalled fetch can never freeze the app) but only the LATEST
// navigation is allowed to commit its nav/final state.
let _renderId = 0;
async function router() {
  const id = ++_renderId;
  const current = () => id === _renderId;
  const h = location.hash || "#/";
  app.innerHTML = `<div class="center"><div class="spinner"></div></div>`;
  window.scrollTo(0, 0);
  for (const [re, view] of routes) {
    const match = h.match(re);
    if (match) {
      try { await view(match); }
      catch (e) { if (current()) app.innerHTML = `<div class="container section"><div class="alert danger">${esc(e.message || "Something went wrong.")}</div></div>`; }
      if (current()) { renderNav(); observeReveals(); wireLabels(); }
      return;
    }
  }
  if (current()) {
    app.innerHTML = `<div class="container section" style="text-align:center;padding:120px 0"><span class="eyebrow" style="justify-content:center">404</span><h2 style="font-size:40px;margin:14px 0 10px">Page not found</h2><p class="muted" style="margin:0 0 22px">The page you're looking for doesn't exist.</p><a class="btn btn-primary" href="#/">Back home</a></div>`;
    renderNav();
  }
}

window.addEventListener("hashchange", router);
supabase.auth.onAuthStateChange((_evt, s) => { session = s; });

(async () => { await loadSession(); renderNav(); await router(); })();
