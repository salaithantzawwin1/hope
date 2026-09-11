-- ============================================================================
-- Hope International School — Cloudflare D1 schema
-- ============================================================================
-- SQLite port of supabase/schema.sql (docs/cloudflare-migration-plan.md §5).
-- This file is the source of truth going forward; supabase/schema.sql stays
-- in git history until the Supabase project is retired (Phase 3).
--
-- Apply locally (offline dev / Miniflare):
--   npx wrangler d1 execute hope-db --local --file worker/schema.sql
--
-- Apply to production (after `npx wrangler d1 create hope-db` and setting
-- database_id in wrangler.jsonc):
--   npx wrangler d1 execute hope-db --remote --file worker/schema.sql
--
-- The file is idempotent (`if not exists` / `on conflict do nothing`), so it
-- is safe to run again at any time.
--
-- Dialect notes (vs. Postgres):
--   uuid           → text, generated with crypto.randomUUID() in the Worker
--   timestamptz    → text holding ISO-8601 UTC; sort order is identical
--   date           → text 'YYYY-MM-DD' (same for today's WHERE date >= ? filters)
--   Supabase RLS   → enforced in the Worker: reads are public, writes require
--                    a staff JWT (Phase 3 replaces this with Cloudflare Access).
-- ============================================================================

-- ---------- News ----------
create table if not exists news (
  id text primary key,
  title_en text not null default '',
  title_my text not null default '',
  body_en text not null default '',
  body_my text not null default '',
  image_url text,
  published_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists news_published_at_idx on news(published_at desc);

-- ---------- Events ----------
create table if not exists events (
  id text primary key,
  title_en text not null default '',
  title_my text not null default '',
  date text not null,
  time text,
  location_en text,
  location_my text,
  description_en text,
  description_my text,
  image_url text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists events_date_idx on events(date);

-- ---------- Editable site text ----------
-- Plain key/value rows (seeded below) live here alongside JSON rows the admin
-- portal creates on first save (home_stats, home_programs, home_cta,
-- academics_*, about_*, header_content, footer_content) — same as today.
create table if not exists site_content (
  key text primary key,
  value_en text not null default '',
  value_my text not null default '',
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------- Photo gallery ----------
create table if not exists gallery (
  id text primary key,
  image_url text not null,
  caption_en text,
  caption_my text,
  album_en text,
  album_my text,
  album_desc_en text,
  album_desc_my text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists gallery_created_at_idx on gallery(created_at desc);

-- ============================================================================
-- Seed the editable site text (edit later from the admin portal).
-- Kept byte-identical to the Supabase seed so both schemas stay in sync until
-- the Supabase project is retired. `on conflict do nothing` never overwrites
-- text staff have already edited.
-- ============================================================================
insert into site_content (key, value_en, value_my) values
  ('home_hero_badge', 'Hope International School', 'Hope အပြည်ပြည်ဆိုင်ရာ ကျောင်း'),
  ('home_hero_title', 'Nurturing Global Citizens, One Student at a Time', 'ကမ္ဘာ့နိုင်ငံသားကောင်းများကို ပြုစုပျိုးထောင်ခြင်း'),
  ('home_hero_subtitle', 'A world-class international education in Myanmar — from Early Years to High School, where students learn in English and Burmese, grow in confidence, and become caring leaders of tomorrow.', 'မြန်မာနိုင်ငံရှိ ကမ္ဘာ့အဆင့်မီ နိုင်ငံတကာပညာရေး — မူကြိုမှ အထက်တန်းအထိ၊ အင်္ဂလိပ်နှင့် မြန်မာဘာသာ နှစ်မျိုးလုံးဖြင့် သင်ယူပြီး ယုံကြည်မှု တည်ဆောက်ကာ နောင်တွင် ကြင်နာတတ်သော ခေါင်းဆောင်များ ဖြစ်လာစေရန် ပြုစုပေးပါသည်။'),
  ('home_welcome_title', 'Welcome to Our School', 'ကျောင်းမှ ကြိုဆိုပါသည်'),
  ('home_welcome_text', 'At Hope International School, we believe every child is unique. Our caring teachers, modern facilities and a balanced international curriculum help each student discover their strengths, think critically and act with kindness.', 'Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် ကလေးတိုင်းသည် ထူးခြားသည်ဟု ကျွန်ုပ်တို့ ယုံကြည်ပါသည်။ ဂရုစိုက်တတ်သော ဆရာ ဆရာမများ၊ ခေတ်မီသော သင်ကြားရေးအဆောက်အအုံများနှင့် မျှတသော နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းသည် ကျောင်းသားတိုင်း မိမိ၏ အရည်အချင်းများကို ရှာဖွေတွေ့ရှိနိုင်ရန် ကူညီပေးပါသည်။'),
  ('about_intro', 'Hope International School is a vibrant learning community in Myanmar where international standards meet local values.', 'Hope အပြည်ပြည်ဆိုင်ရာကျောင်းသည် နိုင်ငံတကာ စံနှုန်းများနှင့် ဒေသဆိုင်ရာ တန်ဖိုးများ ပေါင်းစပ်ထားသော မြန်မာနိုင်ငံရှိ တက်ကြွသော သင်ယူမှု အသိုင်းအဝိုင်းတစ်ခုဖြစ်သည်။'),
  ('academics_intro', 'Our curriculum blends international teaching standards with the best of Myanmar culture. Students learn to think deeply, ask questions and apply their knowledge to real life.', 'ကျွန်ုပ်တို့၏ သင်ရိုးညွှန်းတမ်းသည် နိုင်ငံတကာ သင်ကြားရေး စံနှုန်းများနှင့် မြန်မာ့ယဉ်ကျေးမှု၏ အကောင်းဆုံးအရာများကို ပေါင်းစပ်ထားသည်။ ကျောင်းသားများသည် နက်နက်ရှိုင်းရှိုင်း တွေးခေါ်တတ်ရန်၊ မေးခွန်းထုတ်တတ်ရန်နှင့် မိမိတို့၏ အသိပညာကို လက်တွေ့ဘဝတွင် အသုံးချတတ်ရန် သင်ယူကြသည်။'),
  ('about_sections', '[]', '[]')
on conflict (key) do nothing;
