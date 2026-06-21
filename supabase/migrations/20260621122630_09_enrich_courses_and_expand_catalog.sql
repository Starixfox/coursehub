-- CourseHub :: Migration 09 — marketplace fields + a fuller catalog
alter table public.courses
  add column if not exists students_count    int not null default 0,
  add column if not exists rating            numeric(2,1),
  add column if not exists rating_count      int not null default 0,
  add column if not exists learning_outcomes jsonb not null default '[]'::jsonb;

update public.courses set students_count=4820, rating=4.8, rating_count=1240,
  learning_outcomes='["Build and deploy a full-stack Next.js app","Master the App Router, routing and data fetching","Style production UIs with Tailwind","Connect a Postgres database with auth"]'::jsonb
  where slug='modern-web-dev-nextjs';
update public.courses set students_count=3110, rating=4.7, rating_count=860,
  learning_outcomes='["Apply visual hierarchy to any interface","Build an accessible color system","Design responsive layouts that scale","Run lightweight usability tests"]'::jsonb
  where slug='designing-for-the-web';
update public.courses set students_count=1980, rating=4.9, rating_count=540,
  learning_outcomes='["Find your first paying customers","Package value into pricing tiers","Build a repeatable go-to-market motion","Measure the metrics that matter"]'::jsonb
  where slug='launch-and-scale-a-saas';

-- Seven more published courses, each with a module, lessons and gated content.
-- (Course/lesson definitions live in a JSONB array; the loop inserts rows with
--  generated UUIDs so no ids are hard-coded.)
do $$
declare
  creator constant uuid := '22222222-2222-2222-2222-222222222222';
  cid uuid; mid uuid; lid uuid; idx int; c jsonb; l jsonb;
  courses jsonb := $json$[
    {"title":"Python for Data Analysis","slug":"python-for-data-analysis","cat":"Data","level":"beginner","tier":"basic","students":6240,"rating":4.7,"ratings":2100,"subtitle":"Turn raw data into insight with pandas","desc":"Go from spreadsheets to real data analysis with Python and pandas, then communicate findings that drive decisions.","outcomes":["Write clean, readable Python","Wrangle data with pandas","Clean and reshape messy datasets","Build clear charts that tell a story"],"lessons":[{"title":"Your first analysis in Python","dur":240,"html":"<h2>Welcome</h2><p>Set up your environment and run your first analysis.</p>"},{"title":"The pandas DataFrame","dur":620,"html":"<h2>DataFrames</h2><p>Load, select and filter tabular data.</p>"},{"title":"Cleaning real-world data","dur":700,"html":"<h2>Cleaning</h2><p>Handle missing values, types and duplicates.</p>"},{"title":"Visualizing results","dur":540,"html":"<h2>Charts</h2><p>Turn a DataFrame into a chart in seconds.</p>"}]},
    {"title":"UI/UX Design Fundamentals","slug":"ui-ux-design-fundamentals","cat":"Design","level":"beginner","tier":"basic","students":7310,"rating":4.8,"ratings":2680,"subtitle":"Design products people love to use","desc":"Learn the design process from research to handoff, and craft interfaces that are both beautiful and usable.","outcomes":["Run a simple design process","Wireframe and prototype quickly","Make confident type and color choices","Test designs with real users"],"lessons":[{"title":"How designers think","dur":300,"html":"<h2>Design thinking</h2><p>Start from the user problem.</p>"},{"title":"Wireframing fast","dur":560,"html":"<h2>Wireframes</h2><p>Sketch flows before pixels.</p>"},{"title":"Type & color systems","dur":640,"html":"<h2>Systems</h2><p>Build a scale you can reuse.</p>"},{"title":"Usability testing","dur":480,"html":"<h2>Testing</h2><p>Five users teach you most of it.</p>"}]},
    {"title":"Mastering TypeScript","slug":"mastering-typescript","cat":"Development","level":"intermediate","tier":"pro","students":3950,"rating":4.9,"ratings":1310,"subtitle":"Type-safe JavaScript at scale","desc":"Level up from JavaScript to confident, type-safe TypeScript with generics, narrowing and strict projects.","outcomes":["Model data with precise types","Use generics with confidence","Narrow types safely","Configure strict TS projects"],"lessons":[{"title":"Why types matter","dur":260,"html":"<h2>Types</h2><p>Catch bugs at compile time.</p>"},{"title":"Generics in depth","dur":720,"html":"<h2>Generics</h2><p>Reusable, type-safe building blocks.</p>"},{"title":"Narrowing & guards","dur":600,"html":"<h2>Narrowing</h2><p>Teach the compiler what you know.</p>"},{"title":"Project configuration","dur":520,"html":"<h2>Config</h2><p>Strict settings that pay off.</p>"}]},
    {"title":"Digital Marketing Playbook","slug":"digital-marketing-playbook","cat":"Marketing","level":"beginner","tier":"basic","students":5120,"rating":4.6,"ratings":1890,"subtitle":"Grow an audience and turn it into revenue","desc":"A practical playbook for modern marketing: funnels, SEO, paid ads and email.","outcomes":["Design a marketing funnel","Rank content with SEO","Launch profitable paid ads","Build an email list that converts"],"lessons":[{"title":"The marketing funnel","dur":320,"html":"<h2>Funnels</h2><p>Attract, convert and retain.</p>"},{"title":"SEO foundations","dur":640,"html":"<h2>SEO</h2><p>Earn traffic that keeps paying off.</p>"},{"title":"Paid acquisition","dur":700,"html":"<h2>Paid ads</h2><p>Spend a dollar, learn a dollar.</p>"},{"title":"Email that converts","dur":520,"html":"<h2>Email</h2><p>The highest-ROI channel.</p>"}]},
    {"title":"Cloud & DevOps Essentials","slug":"cloud-devops-essentials","cat":"Development","level":"intermediate","tier":"pro","students":2740,"rating":4.7,"ratings":920,"subtitle":"Ship and operate software with confidence","desc":"Containerize an app, automate a pipeline and deploy to the cloud the way real teams do.","outcomes":["Adopt a DevOps mindset","Containerize apps with Docker","Automate CI/CD pipelines","Deploy to the cloud safely"],"lessons":[{"title":"The DevOps mindset","dur":300,"html":"<h2>Mindset</h2><p>Automate commit to production.</p>"},{"title":"Containers with Docker","dur":680,"html":"<h2>Docker</h2><p>Package once, run anywhere.</p>"},{"title":"CI/CD pipelines","dur":640,"html":"<h2>Pipelines</h2><p>Every push, tested and shipped.</p>"},{"title":"Deploying to the cloud","dur":600,"html":"<h2>Deploy</h2><p>From localhost to a real URL.</p>"}]},
    {"title":"Product Management 101","slug":"product-management-101","cat":"Business","level":"beginner","tier":"basic","students":4480,"rating":4.5,"ratings":1450,"subtitle":"Build the right thing, then build it right","desc":"The fundamentals of modern product management: discovery, prioritization, roadmaps and metrics.","outcomes":["Run effective discovery","Prioritize with frameworks","Build and communicate a roadmap","Define and track success metrics"],"lessons":[{"title":"What product managers do","dur":300,"html":"<h2>The role</h2><p>Users, business and tech.</p>"},{"title":"Customer discovery","dur":560,"html":"<h2>Discovery</h2><p>Fall in love with the problem.</p>"},{"title":"Roadmaps that work","dur":600,"html":"<h2>Roadmaps</h2><p>Outcomes over output.</p>"},{"title":"Metrics & experiments","dur":520,"html":"<h2>Metrics</h2><p>Know whether it worked.</p>"}]},
    {"title":"Machine Learning Foundations","slug":"machine-learning-foundations","cat":"Data","level":"advanced","tier":"premium","students":2010,"rating":4.9,"ratings":760,"subtitle":"The core ideas behind modern ML","desc":"Build real intuition for machine learning: how models learn, regression, classification and honest evaluation.","outcomes":["Explain how models learn","Train regression models","Build classifiers","Evaluate models honestly"],"lessons":[{"title":"What is machine learning?","dur":340,"html":"<h2>Overview</h2><p>Learning patterns from data.</p>"},{"title":"Regression","dur":720,"html":"<h2>Regression</h2><p>Predict a number from features.</p>"},{"title":"Classification","dur":700,"html":"<h2>Classification</h2><p>Predict a category.</p>"},{"title":"Evaluating models","dur":640,"html":"<h2>Evaluation</h2><p>Train/test splits and metrics.</p>"}]}
  ]$json$::jsonb;
begin
  for c in select value from jsonb_array_elements(courses) loop
    insert into public.courses (creator_id, creator_name, title, slug, subtitle, description, category, level, required_tier, status, published_at, students_count, rating, rating_count, learning_outcomes)
    values (creator, 'Casey Creator', c->>'title', c->>'slug', c->>'subtitle', c->>'desc', c->>'cat', c->>'level',
            (c->>'tier')::public.subscription_tier, 'published', now(), (c->>'students')::int, (c->>'rating')::numeric, (c->>'ratings')::int, c->'outcomes')
    returning id into cid;
    insert into public.modules (course_id, title, position) values (cid, 'Course lessons', 0) returning id into mid;
    idx := 0;
    for l in select value from jsonb_array_elements(c->'lessons') loop
      insert into public.lessons (module_id, course_id, title, position, duration_seconds, is_preview, has_video)
      values (mid, cid, l->>'title', idx, (l->>'dur')::int, (idx = 0), true) returning id into lid;
      insert into public.lesson_content (lesson_id, content_html, cf_stream_uid)
      values (lid, l->>'html', case when idx % 2 = 0 then 'demo-sample-1' else 'demo-sample-2' end);
      idx := idx + 1;
    end loop;
  end loop;
end $$;
