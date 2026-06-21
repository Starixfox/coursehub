import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const app = document.getElementById("app");
const navEl = document.getElementById("nav");
const SAMPLE_HLS =
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8";

const TIER_RANK = { free: 0, basic: 1, pro: 2, premium: 3 };
const TIERS = [
  { id: "free", name: "Free", price: 0, blurb: "Preview the platform",
    features: ["Browse the full catalog", "Watch preview lessons", "Track progress"] },
  { id: "basic", name: "Basic", price: 12, blurb: "A focused path",
    features: ["Everything in Free", "Full Basic-tier courses", "720p video"] },
  { id: "pro", name: "Pro", price: 29, blurb: "The whole catalog", highlight: true,
    features: ["Everything in Basic", "Full catalog (Basic + Pro)", "1080p video", "Downloads"] },
  { id: "premium", name: "Premium", price: 59, blurb: "For teams & power learners",
    features: ["Everything in Pro", "Early access", "Certificates", "Up to 5 seats", "4K video"] },
];

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
const tierBadge = (t) => {
  const cls = t === "premium" ? "warning" : t === "free" ? "" : "primary";
  return `<span class="badge ${cls}">${esc(t[0].toUpperCase() + t.slice(1))}</span>`;
};
const go = (hash) => (location.hash = hash);

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

function renderNav() {
  const right = session
    ? `${tierBadge(tier)}
       ${profile?.role === "creator" || profile?.role === "admin" ? `<a class="btn btn-ghost btn-sm" href="#/account">Studio</a>` : ""}
       <a class="btn btn-ghost btn-sm" href="#/account">Account</a>
       <button class="btn btn-outline btn-sm" id="signout">Sign out</button>`
    : `<a class="btn btn-ghost btn-sm" href="#/login">Log in</a>
       <a class="btn btn-primary btn-sm" href="#/register">Sign up</a>`;
  navEl.innerHTML = `
    <a class="brand text-gradient" href="#/">CourseHub</a>
    <nav class="nav-links">
      <a href="#/catalog">Catalog</a>
      <a href="#/pricing">Pricing</a>
      ${session ? `<a href="#/dashboard">Dashboard</a>` : ""}
    </nav>
    <div class="nav-spacer"></div>
    <div class="nav-right">${right}</div>`;
  const so = document.getElementById("signout");
  if (so) so.onclick = async () => { await supabase.auth.signOut(); await loadSession(); go("#/"); router(); };
}

/* ---------------- data ---------------- */
async function getCourses({ search, category, tier: ftier } = {}) {
  let q = supabase.from("courses").select("*").eq("status", "published").order("published_at", { ascending: false });
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

/* ---------------- views ---------------- */
const courseCard = (c) => `
  <div class="card course-card" onclick="location.hash='#/course/${esc(c.slug)}'">
    <div class="course-thumb">${({ Development: "💻", Design: "🎨", Business: "📈" }[c.category] || "📚")}</div>
    <div class="body">
      <div class="row">${tierBadge(c.required_tier)}${c.level ? `<span class="badge">${esc(c.level)}</span>` : ""}</div>
      <h3>${esc(c.title)}</h3>
      <p class="muted" style="font-size:13px;margin:0">${esc(c.subtitle || "")}</p>
      <div class="row"><span class="muted" style="font-size:12px">${esc(c.creator_name || "")}</span></div>
    </div>
  </div>`;

async function viewHome() {
  const courses = await getCourses();
  app.innerHTML = `
    <section class="hero container">
      <span class="badge primary">Powered by Supabase Auth + RLS</span>
      <h1>Master new skills with <span class="text-gradient">premium courses</span></h1>
      <p>Stream expert-led courses, learn at your own pace, and unlock more as you grow. Access is enforced by the database — not hidden in the UI.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="#/catalog">Browse catalog</a>
        <a class="btn btn-outline btn-lg" href="#/pricing">See pricing</a>
      </div>
    </section>
    <section class="section container">
      <div class="section-head"><div><h2>Featured courses</h2><p class="section-sub">A taste of what is inside.</p></div>
        <a class="btn btn-ghost btn-sm" href="#/catalog">View all →</a></div>
      <div class="grid">${courses.slice(0, 6).map(courseCard).join("") || `<p class="muted">No published courses yet.</p>`}</div>
    </section>`;
}

async function viewCatalog() {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const filters = { search: params.get("q") || "", category: params.get("category") || "", tier: params.get("tier") || "" };
  app.innerHTML = `<div class="container section"><div class="center"><div class="spinner"></div></div></div>`;
  const [courses, cats] = await Promise.all([getCourses(filters), getCourses().then((cs) => [...new Set(cs.map((c) => c.category).filter(Boolean))])]);
  app.innerHTML = `
    <section class="container section">
      <h2>Catalog</h2><p class="section-sub">Browse every published course. Filter by category or plan.</p>
      <div class="filters">
        <input class="input" id="f-q" placeholder="Search courses…" value="${esc(filters.search)}" style="min-width:220px" />
        <select class="input" id="f-cat"><option value="">All categories</option>${cats.map((c) => `<option ${c === filters.category ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
        <select class="input" id="f-tier"><option value="">All tiers</option>${["free", "basic", "pro", "premium"].map((t) => `<option value="${t}" ${t === filters.tier ? "selected" : ""}>${t[0].toUpperCase() + t.slice(1)}</option>`).join("")}</select>
      </div>
      <div class="grid">${courses.map(courseCard).join("") || `<div class="card pad muted">No courses match these filters.</div>`}</div>
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
  if (!course) { app.innerHTML = `<div class="container section"><h2>Course not found</h2><a class="btn btn-outline" href="#/catalog">Back to catalog</a></div>`; return; }
  const modules = await getCurriculum(course.id);
  const hasAccess = TIER_RANK[tier] >= TIER_RANK[course.required_tier];
  const lessonRow = (l) => {
    const unlocked = l.is_preview || hasAccess;
    return `<div class="lesson-row ${unlocked ? "clickable" : ""}" ${unlocked ? `onclick="location.hash='#/lesson/${l.id}'"` : ""}>
      <span class="ico">${unlocked ? "▶" : "🔒"}</span>
      <span class="t">${esc(l.title)} ${l.is_preview ? `<span class="badge success" style="margin-left:6px">Preview</span>` : ""}</span>
      <span class="dur">${fmtDur(l.duration_seconds)}</span></div>`;
  };
  app.innerHTML = `
    <div class="container detail-head">
      <div>
        <div class="row">${tierBadge(course.required_tier)}${course.category ? `<span class="badge">${esc(course.category)}</span>` : ""}${course.level ? `<span class="badge">${esc(course.level)}</span>` : ""}</div>
        <h1>${esc(course.title)}</h1>
        <p class="muted" style="font-size:17px">${esc(course.subtitle || "")}</p>
        <p class="prose">${esc(course.description || "")}</p>
        <p class="muted" style="font-size:13px">Instructor · ${esc(course.creator_name || "")}</p>
        <h2 style="margin-top:28px;font-size:20px">Curriculum</h2>
        ${modules.map((mod) => `<div class="module"><p class="module-title">${esc(mod.title)}</p>${mod.lessons.map(lessonRow).join("")}</div>`).join("") || `<p class="muted">No lessons yet.</p>`}
      </div>
      <div class="card pad cta-card stack">
        ${hasAccess
          ? `<p style="margin:0;font-weight:600">You have access ✓</p><p class="muted" style="margin:0;font-size:14px">Your ${esc(tier)} plan covers this course.</p>
             <a class="btn btn-primary" href="#/lesson/${modules.flatMap((x) => x.lessons)[0]?.id || ""}">Start learning</a>`
          : `<p style="margin:0;font-weight:600">Requires ${esc(course.required_tier)}</p>
             <p class="muted" style="margin:0;font-size:14px">Preview lessons are free. Subscribe to unlock the full course.</p>
             <a class="btn btn-primary" href="#/pricing">View plans</a>
             ${session ? "" : `<a class="btn btn-outline" href="#/login">Log in</a>`}`}
      </div>
    </div>`;
}

async function viewLesson(m) {
  const lessonId = decodeURIComponent(m[1]);
  // Lesson metadata (RLS: visible for published courses)
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  if (!lesson) { app.innerHTML = `<div class="container section"><h2>Lesson not found</h2></div>`; return; }
  const course = await getCourse((await supabase.from("courses").select("slug").eq("id", lesson.course_id).maybeSingle()).data?.slug || "");
  const modules = course ? await getCurriculum(course.id) : [];
  // THE GATE: lesson_content is returned by RLS only if preview/owned/entitled.
  const { data: content } = await supabase.from("lesson_content").select("content_html, cf_stream_uid").eq("lesson_id", lessonId).maybeSingle();
  const unlocked = !!content;

  const side = modules.flatMap((mod) => mod.lessons).map((l) => {
    const ok = l.is_preview || TIER_RANK[tier] >= TIER_RANK[course?.required_tier || "basic"];
    return `<div class="side-lesson ${l.id === lessonId ? "active" : ""} ${ok ? "" : "locked"}" onclick="location.hash='#/lesson/${l.id}'">
      <span>${ok ? (l.id === lessonId ? "▶" : "○") : "🔒"}</span><span>${esc(l.title)}</span></div>`;
  }).join("");

  app.innerHTML = `
    <div class="container learn">
      <aside class="sidebar card pad">
        <a class="muted" style="font-size:13px" href="#/course/${esc(course?.slug || "")}">← ${esc(course?.title || "Course")}</a>
        <div class="stack" style="margin-top:12px">${side}</div>
      </aside>
      <div>
        <h1 style="font-size:24px;margin:0 0 14px">${esc(lesson.title)}</h1>
        ${unlocked
          ? `<video id="player" class="player" controls playsinline></video>
             <div class="prose" style="margin-top:20px">${content.content_html || ""}</div>
             <div class="row" style="margin-top:18px">
               <button class="btn btn-primary" id="complete">Mark complete</button>
               <span class="muted" id="complete-msg" style="font-size:14px"></span>
             </div>`
          : `<div class="locked-box">
               <div style="font-size:40px">🔒</div>
               <h2 style="margin:0;font-size:20px">This lesson is locked</h2>
               <p class="muted" style="margin:0;max-width:42ch">Your current plan (${esc(tier)}) doesn't include this lesson. Upgrade to watch the full course.</p>
               <div class="row">${session ? "" : `<a class="btn btn-outline" href="#/login">Log in</a>`}<a class="btn btn-primary" href="#/pricing">View plans</a></div>
             </div>`}
      </div>
    </div>`;

  if (unlocked) {
    const v = document.getElementById("player");
    if (window.Hls && window.Hls.isSupported()) { const hls = new window.Hls(); hls.loadSource(SAMPLE_HLS); hls.attachMedia(v); }
    else if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = SAMPLE_HLS; }
    const btn = document.getElementById("complete");
    if (btn) btn.onclick = async () => {
      if (!session) { go("#/login"); return; }
      btn.disabled = true;
      const { error } = await supabase.from("lesson_progress").upsert(
        { user_id: session.user.id, lesson_id: lessonId, course_id: lesson.course_id, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" });
      document.getElementById("complete-msg").textContent = error ? "Could not save (are you logged in?)" : "Completed ✓";
    };
  }
}

function authForm(mode) {
  const isReg = mode === "register";
  app.innerHTML = `
    <div class="container"><div class="auth-wrap card pad">
      <h2 style="margin:0 0 4px">${isReg ? "Create your account" : "Welcome back"}</h2>
      <p class="muted" style="margin:0 0 18px">${isReg ? "Start learning in minutes." : "Log in to continue."}</p>
      <div id="auth-msg"></div>
      <form id="auth-form">
        ${isReg ? `<div class="field"><label>Full name</label><input class="input" name="full_name" required /></div>` : ""}
        <div class="field"><label>Email</label><input class="input" type="email" name="email" required /></div>
        <div class="field"><label>Password</label><input class="input" type="password" name="password" minlength="${isReg ? 10 : 1}" required /></div>
        <button class="btn btn-primary btn-lg" style="width:100%" id="submit">${isReg ? "Create account" : "Log in"}</button>
      </form>
      <p class="muted" style="font-size:14px;margin-top:14px">
        ${isReg ? `Already have an account? <a class="text-gradient" href="#/login">Log in</a>` : `New here? <a class="text-gradient" href="#/register">Sign up</a>`}
      </p>
      ${!isReg ? `<p class="muted" style="font-size:13px;margin-top:8px">Demo: <code>pro@coursehub.dev</code> / <code>CourseHubDemo!2026</code></p>` : ""}
    </div></div>`;
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
          options: { data: { full_name: f.get("full_name") }, emailRedirectTo: location.origin + location.pathname },
        });
        if (error) throw error;
        setMsg("Account created. If email confirmation is on, check your inbox — then log in.", "success");
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
  const recommended = await getCourses();
  const cards = (enrolls || []).map((e) => e.courses).filter(Boolean);
  app.innerHTML = `
    <section class="container section">
      <h2>Welcome back${profile?.full_name ? ", " + esc(profile.full_name.split(" ")[0]) : ""}</h2>
      <p class="section-sub">You're on the ${tierBadge(tier)} plan.</p>
      <h3 style="margin-top:18px">Continue learning</h3>
      <div class="grid">${cards.map(courseCard).join("") || `<div class="card pad muted">You haven't started a course yet. <a class="text-gradient" href="#/catalog">Browse the catalog →</a></div>`}</div>
      <h3 style="margin-top:34px">Recommended</h3>
      <div class="grid">${recommended.slice(0, 3).map(courseCard).join("")}</div>
    </section>`;
}

async function viewAccount() {
  if (!session) { go("#/login"); return; }
  app.innerHTML = `
    <section class="container section">
      <h2>Account</h2>
      <div class="grid" style="grid-template-columns:1fr 1fr;max-width:760px">
        <div class="card pad stack">
          <h3 style="margin:0">Profile</h3>
          <p class="muted" style="margin:0">${esc(profile?.full_name || "")}</p>
          <p class="muted" style="margin:0">${esc(session.user.email)}</p>
          <p style="margin:0">Role: <span class="badge">${esc(profile?.role || "subscriber")}</span></p>
        </div>
        <div class="card pad stack">
          <h3 style="margin:0">Subscription</h3>
          <p style="margin:0">Current plan: ${tierBadge(tier)}</p>
          <p class="muted" style="margin:0;font-size:14px">Tier access is resolved server-side via the <code>my_current_tier</code> RPC and enforced by RLS.</p>
          <a class="btn btn-outline btn-sm" href="#/pricing">Change plan</a>
        </div>
      </div>
    </section>`;
}

function viewPricing() {
  app.innerHTML = `
    <section class="container section">
      <h2>Simple, tiered pricing</h2><p class="section-sub">Upgrade any time. Higher tiers unlock more of the catalog.</p>
      <div class="tiers">
        ${TIERS.map((t) => `
          <div class="card pad tier ${t.highlight ? "highlight" : ""}">
            ${t.highlight ? `<span class="badge primary" style="align-self:flex-start">Most popular</span>` : ""}
            <div><div style="font-weight:600">${t.name}</div><div class="muted" style="font-size:13px">${t.blurb}</div></div>
            <div class="price">${t.price === 0 ? "Free" : "$" + t.price}<span class="muted" style="font-size:14px;font-weight:400">${t.price ? "/mo" : ""}</span></div>
            <ul>${t.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
            <div style="margin-top:auto">${tier === t.id ? `<button class="btn btn-outline" style="width:100%" disabled>Current plan</button>` : `<a class="btn ${t.highlight ? "btn-primary" : "btn-outline"}" style="width:100%" href="${session ? "#/account" : "#/register"}">${t.price ? "Choose " + t.name : "Get started"}</a>`}</div>
          </div>`).join("")}
      </div>
      <p class="muted" style="font-size:13px;margin-top:18px">Note: this static build demonstrates Supabase auth + RLS gating. Live Stripe checkout runs in the full server variant of this repo.</p>
    </section>`;
}

/* ---------------- router ---------------- */
const routes = [
  [/^#?\/?$/, viewHome],
  [/^#\/catalog/, viewCatalog],
  [/^#\/course\/(.+)$/, viewCourse],
  [/^#\/lesson\/(.+)$/, viewLesson],
  [/^#\/login$/, viewLogin],
  [/^#\/register$/, viewRegister],
  [/^#\/dashboard$/, viewDashboard],
  [/^#\/account$/, viewAccount],
  [/^#\/pricing$/, viewPricing],
];

async function router() {
  const h = location.hash || "#/";
  app.innerHTML = `<div class="center"><div class="spinner"></div></div>`;
  window.scrollTo(0, 0);
  for (const [re, view] of routes) {
    const match = h.match(re);
    if (match) { try { await view(match); } catch (e) { app.innerHTML = `<div class="container section"><div class="alert danger">${esc(e.message || "Error")}</div></div>`; } renderNav(); return; }
  }
  app.innerHTML = `<div class="container section"><h2>Page not found</h2><a class="btn btn-outline" href="#/">Go home</a></div>`;
  renderNav();
}

window.addEventListener("hashchange", router);
supabase.auth.onAuthStateChange((_evt, s) => { session = s; });

(async () => { await loadSession(); renderNav(); await router(); })();
