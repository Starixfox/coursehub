-- CourseHub :: Migration 07 — demo seed (accounts, courses, content, subscription)
-- Demo password for ALL accounts: CourseHubDemo!2026

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change_token_new, email_change,
   is_sso_user, is_anonymous)
values
  ('00000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','authenticated','authenticated',
   'admin@coursehub.dev', crypt('CourseHubDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}','{"full_name":"Avery Admin"}', now(), now(), '', '', '', '', false, false),
  ('00000000-0000-0000-0000-000000000000','22222222-2222-2222-2222-222222222222','authenticated','authenticated',
   'creator@coursehub.dev', crypt('CourseHubDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}','{"full_name":"Casey Creator"}', now(), now(), '', '', '', '', false, false),
  ('00000000-0000-0000-0000-000000000000','33333333-3333-3333-3333-333333333333','authenticated','authenticated',
   'pro@coursehub.dev', crypt('CourseHubDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}','{"full_name":"Pat Pro"}', now(), now(), '', '', '', '', false, false),
  ('00000000-0000-0000-0000-000000000000','44444444-4444-4444-4444-444444444444','authenticated','authenticated',
   'free@coursehub.dev', crypt('CourseHubDemo!2026', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}','{"full_name":"Finley Free"}', now(), now(), '', '', '', '', false, false);

insert into auth.identities (user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id, id::text,
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users
where email in ('admin@coursehub.dev','creator@coursehub.dev','pro@coursehub.dev','free@coursehub.dev');

update public.profiles set role='admin',     full_name='Avery Admin'   where id='11111111-1111-1111-1111-111111111111';
update public.profiles set role='creator',   full_name='Casey Creator' where id='22222222-2222-2222-2222-222222222222';
update public.profiles set role='subscriber',full_name='Pat Pro'       where id='33333333-3333-3333-3333-333333333333';
update public.profiles set role='subscriber',full_name='Finley Free'   where id='44444444-4444-4444-4444-444444444444';

insert into public.subscriptions
  (user_id, stripe_customer_id, stripe_subscription_id, tier, status, billing_interval, current_period_end, seats)
values
  ('33333333-3333-3333-3333-333333333333','cus_demo_pro','sub_demo_pro','pro','active','month', now() + interval '30 days', 1);

insert into public.courses (id, creator_id, creator_name, title, slug, subtitle, description, category, level, required_tier, status, published_at) values
 ('a0000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Casey Creator',
  'Modern Web Development with Next.js','modern-web-dev-nextjs',
  'Build production React apps with the App Router',
  'A hands-on path from zero to a deployed full-stack Next.js application, covering routing, data, and styling.',
  'Development','beginner','basic','published', now()),
 ('a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','Casey Creator',
  'Designing for the Web','designing-for-the-web',
  'Visual hierarchy, color, and layout for product teams',
  'Learn the design fundamentals that make interfaces feel premium, from spacing systems to color theory.',
  'Design','intermediate','pro','published', now()),
 ('a0000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Casey Creator',
  'Launch and Scale a SaaS','launch-and-scale-a-saas',
  'From first customer to repeatable revenue',
  'The operator playbook for taking a software product to market and scaling it sustainably.',
  'Business','advanced','premium','published', now());

insert into public.modules (id, course_id, title, position) values
 ('b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000001','Getting Started',0),
 ('b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000001','Building the UI',1),
 ('b0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000002','Design Foundations',0),
 ('b0000000-0000-0000-0000-000000000031','a0000000-0000-0000-0000-000000000003','Go To Market',0);

insert into public.lessons (id, module_id, course_id, title, slug, position, duration_seconds, is_preview, has_video) values
 ('c0000000-0000-0000-0000-000000000101','b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000001','Welcome and Course Overview','welcome',0,212,true,true),
 ('c0000000-0000-0000-0000-000000000102','b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000001','Setting Up Your Environment','setup',1,540,false,true),
 ('c0000000-0000-0000-0000-000000000103','b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000001','Components and Props','components',0,720,false,true),
 ('c0000000-0000-0000-0000-000000000104','b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000001','Styling with Tailwind','styling',1,660,false,true),
 ('c0000000-0000-0000-0000-000000000201','b0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000002','Why Hierarchy Matters','hierarchy',0,300,true,true),
 ('c0000000-0000-0000-0000-000000000202','b0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000002','Building a Color System','color',1,840,false,true),
 ('c0000000-0000-0000-0000-000000000301','b0000000-0000-0000-0000-000000000031','a0000000-0000-0000-0000-000000000003','Finding Your First Customers','first-customers',0,360,true,true),
 ('c0000000-0000-0000-0000-000000000302','b0000000-0000-0000-0000-000000000031','a0000000-0000-0000-0000-000000000003','Pricing and Packaging','pricing',1,900,false,true);

insert into public.lesson_content (lesson_id, content_html, cf_stream_uid) values
 ('c0000000-0000-0000-0000-000000000101','<h2>Welcome</h2><p>This short overview walks through what you will build and how the course is structured.</p>','demo-sample-portrait'),
 ('c0000000-0000-0000-0000-000000000102','<h2>Setup</h2><p>Install Node, create your project, and run the development server.</p>','demo-sample-1'),
 ('c0000000-0000-0000-0000-000000000103','<h2>Components</h2><p>Compose your interface from small, reusable components and pass data with props.</p>','demo-sample-2'),
 ('c0000000-0000-0000-0000-000000000104','<h2>Styling</h2><p>Use utility classes to build a consistent, responsive design quickly.</p>','demo-sample-3'),
 ('c0000000-0000-0000-0000-000000000201','<h2>Hierarchy</h2><p>Guide the eye with size, weight, and spacing so the most important thing reads first.</p>','demo-sample-1'),
 ('c0000000-0000-0000-0000-000000000202','<h2>Color</h2><p>Build an accessible palette with semantic roles and consistent contrast.</p>','demo-sample-2'),
 ('c0000000-0000-0000-0000-000000000301','<h2>First Customers</h2><p>Talk to users early and find the smallest valuable thing you can ship.</p>','demo-sample-1'),
 ('c0000000-0000-0000-0000-000000000302','<h2>Pricing</h2><p>Package value into tiers and price for the outcome you deliver.</p>','demo-sample-2');

insert into public.enrollments (user_id, course_id) values
 ('33333333-3333-3333-3333-333333333333','a0000000-0000-0000-0000-000000000001');
insert into public.lesson_progress (user_id, lesson_id, course_id, completed, last_position_seconds, completed_at) values
 ('33333333-3333-3333-3333-333333333333','c0000000-0000-0000-0000-000000000101','a0000000-0000-0000-0000-000000000001',true,212,now()),
 ('33333333-3333-3333-3333-333333333333','c0000000-0000-0000-0000-000000000102','a0000000-0000-0000-0000-000000000001',false,120,null);
