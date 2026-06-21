import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3/+esm";
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

const CAT_ICON = { Development: "💻", Design: "🎨", Business: "📈", Data: "📊", Marketing: "📣" };
const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");

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
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
// Creator HTML is untrusted — sanitize before STORING (no server in this path).
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

function renderNav() {
  const right = session
    ? `${tierBadge(tier)}
       ${profile?.role === "creator" || profile?.role === "admin" ? `<a class="btn btn-ghost btn-sm" href="#/creator">Studio</a>` : ""}
       ${profile?.role === "admin" ? `<a class="btn btn-ghost btn-sm" href="#/admin">Admin</a>` : ""}
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
    <div class="course-thumb">${CAT_ICON[c.category] || "📚"}</div>
    <div class="body">
      <div class="row">${tierBadge(c.required_tier)}${c.category ? `<span class="badge primary">${esc(c.category)}</span>` : ""}</div>
      <h3>${esc(c.title)}</h3>
      <p class="muted" style="font-size:13px;margin:0">${esc(c.subtitle || "")}</p>
      <div class="row meta" style="margin-top:auto">
        ${c.rating ? `<span class="stars">★ ${c.rating}</span><span>(${fmtNum(c.rating_count)})</span>` : ""}
        ${c.students_count ? `<span>· ${fmtNum(c.students_count)} learners</span>` : ""}
      </div>
      <div class="row"><span class="muted" style="font-size:12px">${esc(c.creator_name || "")}${c.level ? " · " + esc(c.level) : ""}</span></div>
    </div>
  </div>`;

async function viewHome() {
  const courses = await getCourses();
  const cats = [...new Set(courses.map((c) => c.category).filter(Boolean))];
  const totalStudents = courses.reduce((n, c) => n + (c.students_count || 0), 0);
  const rated = courses.filter((c) => c.rating);
  const avg = rated.length ? rated.reduce((n, c) => n + Number(c.rating), 0) / rated.length : 0;
  const popular = [...courses].sort((a, b) => (b.students_count || 0) - (a.students_count || 0)).slice(0, 6);
  const testimonials = [
    ["Maya R.", "Frontend Developer", "I went from following tutorials to shipping a real Next.js app in a month. The lessons are short and the projects actually stick."],
    ["Daniel K.", "Product Manager", "The PM track gave me frameworks I now use every single week. Worth the subscription on its own."],
    ["Aisha N.", "Data Analyst", "Clear, practical, and no fluff. I finally understand pandas instead of copy-pasting from forums."],
  ];
  const faqs = [
    ["What is CourseHub?", "CourseHub is a subscription learning platform. One membership unlocks a growing library of expert-led video courses across development, design, data, business and marketing — learn at your own pace, on any device."],
    ["What do I get with a subscription?", "Full access to every course your plan includes: stream all lessons, download resources on Pro and above, track your progress, and resume right where you left off."],
    ["Can I try it before subscribing?", "Yes. Every course has free preview lessons, and you can browse the entire catalog without an account."],
    ["Can I cancel anytime?", "Absolutely — plans are month-to-month and you keep access until the end of your billing period."],
    ["Do I earn a certificate?", "Premium members earn a shareable certificate of completion for every course they finish."],
    ["How is paid content protected?", "Access is enforced in the database with row-level security. Locked lessons are never sent to your browser — not just hidden in the interface."],
  ];
  app.innerHTML = `
    <section class="hero container">
      <span class="badge primary">★ ${avg.toFixed(1)} average rating · ${fmtNum(totalStudents)}+ learners</span>
      <h1>Learn in-demand skills from <span class="text-gradient">expert-led courses</span></h1>
      <p>CourseHub is a subscription learning platform. Pick a plan and stream professional courses across development, design, data, business and marketing — track your progress, earn certificates, and unlock more as you grow.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="#/catalog">Explore courses</a>
        <a class="btn btn-outline btn-lg" href="#/pricing">View plans</a>
      </div>
    </section>

    <div class="container"><div class="statbar">
      <div class="s"><b>${courses.length}</b><span>Courses</span></div>
      <div class="s"><b>${fmtNum(totalStudents)}+</b><span>Learners enrolled</span></div>
      <div class="s"><b>${avg.toFixed(1)}/5</b><span>Average rating</span></div>
      <div class="s"><b>${cats.length}</b><span>Categories</span></div>
      <div class="s"><b>4</b><span>Membership tiers</span></div>
    </div></div>

    <section class="section container">
      <div class="cols-3">
        <div class="card feature"><div class="ico">🎓</div><h3>Expert-led courses</h3><p>Every course is taught by a practitioner and broken into short, focused lessons you can finish in a sitting.</p></div>
        <div class="card feature"><div class="ico">🔓</div><h3>One membership, full access</h3><p>Subscribe to a plan and instantly unlock everything it includes. Preview lessons are always free.</p></div>
        <div class="card feature"><div class="ico">📜</div><h3>Certificates that count</h3><p>Finish a course on Premium and earn a shareable certificate to add to your résumé and LinkedIn.</p></div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>Browse by category</h2><p class="section-sub">Find your next skill.</p></div></div>
      <div class="cat-grid">${cats.map((cat) => `
        <div class="cat-card" onclick="location.hash='#/catalog?category=${encodeURIComponent(cat)}'">
          <div class="ico">${CAT_ICON[cat] || "📚"}</div><h3>${esc(cat)}</h3>
          <p class="muted" style="margin:0;font-size:13px">${courses.filter((c) => c.category === cat).length} courses</p></div>`).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>Most popular</h2><p class="section-sub">What learners are taking right now.</p></div><a class="btn btn-ghost btn-sm" href="#/catalog">View all →</a></div>
      <div class="grid">${popular.map(courseCard).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>How it works</h2><p class="section-sub">Start learning in three steps.</p></div></div>
      <div class="cols-3">
        <div class="card feature"><div class="step-num">1</div><h3>Choose a plan</h3><p>Pick Basic, Pro or Premium — monthly, and cancel anytime.</p></div>
        <div class="card feature"><div class="step-num">2</div><h3>Start learning</h3><p>Stream lessons, track your progress, and resume right where you left off.</p></div>
        <div class="card feature"><div class="step-num">3</div><h3>Earn a certificate</h3><p>Complete a course and showcase your new skill.</p></div>
      </div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>Plans for every learner</h2><p class="section-sub">Upgrade as you grow.</p></div><a class="btn btn-ghost btn-sm" href="#/pricing">Compare plans →</a></div>
      <div class="tiers">${TIERS.map((t) => `
        <div class="card pad tier ${t.highlight ? "highlight" : ""}">
          ${t.highlight ? `<span class="badge primary" style="align-self:flex-start">Most popular</span>` : ""}
          <div><div style="font-weight:600">${t.name}</div><div class="muted" style="font-size:13px">${t.blurb}</div></div>
          <div class="price">${t.price === 0 ? "Free" : "$" + t.price}<span class="muted" style="font-size:14px;font-weight:400">${t.price ? "/mo" : ""}</span></div>
          <a class="btn ${t.highlight ? "btn-primary" : "btn-outline"}" style="width:100%" href="#/pricing">${t.price ? "Get " + t.name : "Start free"}</a></div>`).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>Loved by learners</h2><p class="section-sub">Real outcomes from real members.</p></div></div>
      <div class="cols-3">${testimonials.map(([n, role, q]) => `
        <div class="card quote"><p>“${esc(q)}”</p><div class="who"><div class="avatar">${esc(n[0])}</div>
          <div><div style="font-weight:600;font-size:14px">${esc(n)}</div><div class="muted" style="font-size:12px">${esc(role)}</div></div></div></div>`).join("")}</div>
    </section>

    <section class="section container">
      <div class="section-head"><div><h2>Frequently asked questions</h2></div></div>
      <div class="faq" style="max-width:780px">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
    </section>

    <section class="section container"><div class="cta-band">
      <h2 style="margin:0 0 8px;font-size:28px">Start learning today</h2>
      <p class="muted" style="margin:0 auto 20px;max-width:46ch">Join ${fmtNum(totalStudents)}+ learners building real skills on CourseHub.</p>
      <div class="row" style="justify-content:center"><a class="btn btn-primary btn-lg" href="#/register">Create free account</a><a class="btn btn-outline btn-lg" href="#/catalog">Browse courses</a></div>
    </div></section>`;
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
  const allLessons = modules.flatMap((x) => x.lessons);
  const totalDur = allLessons.reduce((s, l) => s + (l.duration_seconds || 0), 0);
  const outcomes = Array.isArray(course.learning_outcomes) ? course.learning_outcomes : [];
  const tierName = course.required_tier[0].toUpperCase() + course.required_tier.slice(1);
  app.innerHTML = `
    <div class="container detail-head">
      <div>
        <div class="row">${tierBadge(course.required_tier)}${course.category ? `<span class="badge primary">${esc(course.category)}</span>` : ""}${course.level ? `<span class="badge">${esc(course.level)}</span>` : ""}</div>
        <h1>${esc(course.title)}</h1>
        <p class="muted" style="font-size:17px;margin:6px 0">${esc(course.subtitle || "")}</p>
        <div class="rating-row">
          ${course.rating ? `<span class="rating-big">★ ${course.rating}</span><span>(${fmtNum(course.rating_count)} ratings)</span><span>·</span>` : ""}
          <span>${fmtNum(course.students_count)} learners</span><span>·</span>
          <span>${allLessons.length} lessons</span><span>·</span><span>${fmtDur(totalDur)}</span>
        </div>
        <p class="muted" style="font-size:13px">Created by ${esc(course.creator_name || "")}</p>
        ${outcomes.length ? `<div class="card pad" style="margin-top:18px"><h2 style="font-size:18px;margin:0 0 14px">What you'll learn</h2><ul class="learn-grid">${outcomes.map((o) => `<li>${esc(String(o))}</li>`).join("")}</ul></div>` : ""}
        <h2 style="margin-top:26px;font-size:20px">About this course</h2>
        <p class="prose">${esc(course.description || "")}</p>
        <h2 style="margin-top:26px;font-size:20px">Curriculum</h2>
        <p class="muted" style="font-size:13px;margin-top:0">${modules.length} section${modules.length === 1 ? "" : "s"} · ${allLessons.length} lessons · ${fmtDur(totalDur)} total</p>
        ${modules.map((mod) => `<div class="module"><p class="module-title">${esc(mod.title)}</p>${mod.lessons.map(lessonRow).join("")}</div>`).join("") || `<p class="muted">No lessons yet.</p>`}
      </div>
      <div class="card pad cta-card stack">
        ${hasAccess
          ? `<p style="margin:0;font-weight:600">You're enrolled ✓</p><p class="muted" style="margin:0;font-size:14px">Your ${esc(tier)} plan covers this course.</p>
             <a class="btn btn-primary" href="#/lesson/${allLessons[0]?.id || ""}">Start learning</a>`
          : `<div class="price" style="font-size:24px;font-weight:700">${tierName} plan</div>
             <p class="muted" style="margin:0;font-size:14px">Subscribe to unlock the full course. Preview lessons are free.</p>
             <a class="btn btn-primary" href="#/pricing">View plans</a>
             ${session ? "" : `<a class="btn btn-outline" href="#/login">Log in</a>`}`}
        <hr />
        <strong style="font-size:14px">This course includes</strong>
        <ul class="includes">
          <li>🎬 ${allLessons.length} on-demand video lessons</li>
          <li>⏱️ ${fmtDur(totalDur)} of content</li>
          <li>📱 Access on any device</li>
          <li>♾️ Full access while subscribed</li>
          ${course.required_tier === "premium" ? `<li>📜 Certificate of completion</li>` : ""}
        </ul>
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
          <div class="field"><label>Full name</label><input class="input" id="acc-name" value="${esc(profile?.full_name || "")}" /></div>
          <p class="muted" style="margin:0">${esc(session.user.email)}</p>
          <p style="margin:0">Role: <span class="badge">${esc(profile?.role || "subscriber")}</span></p>
          <div class="row"><button class="btn btn-primary btn-sm" id="acc-save">Save</button><span class="muted" id="acc-msg" style="font-size:13px"></span></div>
        </div>
        <div class="card pad stack">
          <h3 style="margin:0">Subscription</h3>
          <p style="margin:0">Current plan: ${tierBadge(tier)}</p>
          <p class="muted" style="margin:0;font-size:14px">Tier access is resolved server-side via the <code>my_current_tier</code> RPC and enforced by RLS.</p>
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

/* ---------------- creator studio ---------------- */
async function viewCreator() {
  if (!(await requireRole(["creator", "admin"]))) return;
  const { data: courses } = await supabase.from("courses").select("*").eq("creator_id", session.user.id).order("created_at", { ascending: false });
  app.innerHTML = `
    <section class="container section">
      <div class="section-head"><div><h2>Creator studio</h2><p class="section-sub">Create and manage your courses.</p></div>
        <a class="btn btn-primary" href="#/creator/course/new">+ New course</a></div>
      <div class="grid">${(courses || []).map((c) => `
        <div class="card course-card" onclick="location.hash='#/creator/course/${c.id}'">
          <div class="body">
            <div class="row">${tierBadge(c.required_tier)}<span class="badge ${c.status === "published" ? "success" : ""}">${esc(c.status)}</span></div>
            <h3>${esc(c.title)}</h3><p class="muted" style="font-size:13px;margin:0">${esc(c.subtitle || "")}</p>
          </div></div>`).join("") || `<div class="card pad muted">No courses yet — create your first one.</div>`}</div>
    </section>`;
}

async function viewCreatorNew() {
  if (!(await requireRole(["creator", "admin"]))) return;
  app.innerHTML = `
    <section class="container section"><div class="auth-wrap card pad" style="max-width:600px;margin:20px auto">
      <a class="muted" href="#/creator" style="font-size:13px">← Studio</a>
      <h2 style="margin:6px 0 14px">New course</h2><div id="msg"></div>
      <form id="cform">
        <div class="field"><label>Title</label><input class="input" name="title" required /></div>
        <div class="field"><label>Subtitle</label><input class="input" name="subtitle" /></div>
        <div class="field"><label>Description</label><textarea class="input" name="description" rows="3"></textarea></div>
        <div class="row">
          <div class="field" style="flex:1"><label>Category</label><input class="input" name="category" placeholder="Development" /></div>
          <div class="field"><label>Level</label><select class="input" name="level"><option value="">—</option><option>beginner</option><option>intermediate</option><option>advanced</option></select></div>
          <div class="field"><label>Required tier</label><select class="input" name="required_tier"><option>basic</option><option>pro</option><option>premium</option></select></div>
        </div>
        <button class="btn btn-primary btn-lg" style="width:100%">Create course</button>
      </form></div></section>`;
  document.getElementById("cform").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get("title");
    const slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase.from("courses").insert({
      creator_id: session.user.id, creator_name: profile?.full_name || null, title, slug,
      subtitle: f.get("subtitle") || null, description: f.get("description") || null,
      category: f.get("category") || null, level: f.get("level") || null,
      required_tier: f.get("required_tier") || "basic", status: "draft",
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
      <div class="section-head"><h2 style="margin:6px 0 0">${esc(course.title)}</h2>
        <button class="btn ${course.status === "published" ? "btn-outline" : "btn-primary"}" id="pub">${course.status === "published" ? "Unpublish" : "Publish"}</button></div>
      <div class="card pad row" style="margin-bottom:18px">${tierBadge(course.required_tier)}<span class="badge ${course.status === "published" ? "success" : ""}">${esc(course.status)}</span><span class="muted" style="font-size:13px">${esc(course.subtitle || "")}</span></div>
      <h3>Curriculum</h3>
      <div>${modules.map((mod) => `
        <div class="card pad" style="margin-bottom:12px">
          <strong>${esc(mod.title)}</strong>
          <div class="stack" style="margin-top:8px">${mod.lessons.map((l) => `
            <div class="lesson-row"><span class="t">${esc(l.title)} ${l.is_preview ? '<span class="badge success">preview</span>' : ""} ${tierBadge(l.required_tier || course.required_tier)}</span>
              <button class="btn btn-ghost btn-sm edit-lesson" data-id="${l.id}">Edit</button></div>`).join("") || '<span class="muted" style="font-size:13px">No lessons yet</span>'}</div>
          <button class="btn btn-outline btn-sm add-lesson" data-mod="${mod.id}" style="margin-top:10px">+ Lesson</button>
        </div>`).join("")}</div>
      <button class="btn btn-outline" id="add-mod">+ Module</button>
      <div id="lesson-editor"></div>
    </section>`;
  document.getElementById("pub").onclick = async () => {
    const next = course.status === "published" ? "draft" : "published";
    await supabase.from("courses").update({ status: next, published_at: next === "published" ? new Date().toISOString() : course.published_at }).eq("id", id);
    router();
  };
  document.getElementById("add-mod").onclick = async () => {
    const title = prompt("Module title"); if (!title) return;
    await supabase.from("modules").insert({ course_id: id, title, position: modules.length });
    router();
  };
  document.querySelectorAll(".add-lesson").forEach((b) => (b.onclick = async () => {
    const title = prompt("Lesson title"); if (!title) return;
    const mod = modules.find((x) => x.id === b.dataset.mod);
    await supabase.from("lessons").insert({ module_id: b.dataset.mod, course_id: id, title, position: mod ? mod.lessons.length : 0 });
    router();
  }));
  document.querySelectorAll(".edit-lesson").forEach((b) => (b.onclick = () => openLessonEditor(b.dataset.id)));
}

async function openLessonEditor(lessonId) {
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  const { data: content } = await supabase.from("lesson_content").select("*").eq("lesson_id", lessonId).maybeSingle();
  const ed = document.getElementById("lesson-editor");
  ed.innerHTML = `<div class="card pad stack" style="margin-top:16px;border-color:var(--border-strong)">
    <h3 style="margin:0">Edit lesson</h3><div id="led-msg"></div>
    <div class="field"><label>Title</label><input class="input" id="l-title" value="${esc(lesson.title)}" /></div>
    <div class="row">
      <label class="row" style="gap:6px;font-size:14px"><input type="checkbox" id="l-prev" ${lesson.is_preview ? "checked" : ""} /> Free preview</label>
      <div class="field"><label>Required tier</label><select class="input" id="l-tier"><option value="">inherit course</option>${["basic", "pro", "premium"].map((t) => `<option ${lesson.required_tier === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <label class="row" style="gap:6px;font-size:14px"><input type="checkbox" id="l-vid" ${lesson.has_video ? "checked" : ""} /> Mock video</label>
    </div>
    <div class="field"><label>Content (HTML — sanitized on save)</label><textarea class="input" id="l-html" rows="5">${esc(content?.content_html || "")}</textarea></div>
    <div class="row"><button class="btn btn-primary" id="l-save">Save</button><button class="btn btn-ghost" id="l-del">Delete</button></div>
  </div>`;
  ed.scrollIntoView({ behavior: "smooth" });
  document.getElementById("l-save").onclick = async () => {
    const hasVid = document.getElementById("l-vid").checked;
    const e1 = await supabase.from("lessons").update({
      title: document.getElementById("l-title").value,
      is_preview: document.getElementById("l-prev").checked,
      required_tier: document.getElementById("l-tier").value || null,
      has_video: hasVid,
    }).eq("id", lessonId);
    const e2 = await supabase.from("lesson_content").upsert({
      lesson_id: lessonId,
      content_html: sanitize(document.getElementById("l-html").value),
      cf_stream_uid: hasVid ? content?.cf_stream_uid || "demo-sample-1" : null,
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
  const mrr = active.reduce((n, s) => n + (s.billing_interval === "year" ? (PRICE[s.tier] || 0) : (PRICE[s.tier] || 0)), 0);
  const published = (courses.data || []).filter((c) => c.status === "published").length;
  const stat = (l, v) => `<div class="card pad"><div class="muted" style="font-size:13px">${l}</div><div style="font-size:28px;font-weight:700;letter-spacing:-.02em">${v}</div></div>`;
  app.innerHTML = `
    <section class="container section">
      <h2>Admin</h2><p class="section-sub">Platform overview.</p>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        ${stat("Active subscriptions", active.length)}${stat("Est. MRR", "$" + mrr)}
        ${stat("Total users", users.count ?? "—")}${stat("Published courses", published)}</div>
      <div class="row" style="margin-top:22px">
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
      <a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2>Users</h2>
      <div class="card pad stack">${(users || []).map((u) => `
        <div class="lesson-row"><span class="t">${esc(u.full_name || "—")} <span class="muted" style="font-size:12px">${esc(u.email || "")}</span></span>
          <select class="input role-sel" data-id="${u.id}" ${u.id === session.user.id ? "disabled title='You cannot change your own role'" : ""}>
            ${["subscriber", "creator", "admin"].map((r) => `<option ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}</select></div>`).join("")}</div>
    </section>`;
  document.querySelectorAll(".role-sel").forEach((s) => (s.onchange = async () => {
    const { error } = await supabase.from("profiles").update({ role: s.value }).eq("id", s.dataset.id);
    if (error) alert(error.message);
  }));
}

async function viewAdminCourses() {
  if (!(await requireRole(["admin"]))) return;
  const { data: courses } = await supabase.from("courses").select("*").order("created_at");
  app.innerHTML = `
    <section class="container section"><a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2>All courses</h2>
      <div class="card pad stack">${(courses || []).map((c) => `
        <div class="lesson-row"><span class="t">${esc(c.title)} ${tierBadge(c.required_tier)} <span class="badge ${c.status === "published" ? "success" : ""}">${esc(c.status)}</span></span>
          <span class="muted" style="font-size:12px">${esc(c.creator_name || "")}</span></div>`).join("")}</div>
    </section>`;
}

async function viewAdminSubs() {
  if (!(await requireRole(["admin"]))) return;
  const { data: subs } = await supabase.from("subscriptions").select("*");
  app.innerHTML = `
    <section class="container section"><a class="muted" href="#/admin" style="font-size:13px">← Admin</a><h2>Subscriptions</h2>
      <div class="card pad stack">${(subs || []).map((s) => `
        <div class="lesson-row"><span class="t">${tierBadge(s.tier)} <span class="badge ${s.status === "active" ? "success" : ""}">${esc(s.status)}</span> ${s.cancel_at_period_end ? '<span class="badge warning">cancels</span>' : ""}</span>
          <span class="muted" style="font-size:12px">${s.current_period_end ? "renews " + new Date(s.current_period_end).toLocaleDateString() : ""}</span></div>`).join("") || '<span class="muted">No subscriptions</span>'}</div>
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
  [/^#\/creator$/, viewCreator],
  [/^#\/creator\/course\/new$/, viewCreatorNew],
  [/^#\/creator\/course\/(.+)$/, viewCreatorCourse],
  [/^#\/admin$/, viewAdmin],
  [/^#\/admin\/users$/, viewAdminUsers],
  [/^#\/admin\/courses$/, viewAdminCourses],
  [/^#\/admin\/subscriptions$/, viewAdminSubs],
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
