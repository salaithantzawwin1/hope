-- ============================================================
-- Hope International School — Supabase setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- News ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_my text not null default '',
  body_en text not null default '',
  body_my text not null default '',
  image_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- Events ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_my text not null default '',
  date date not null,
  time text,
  location_en text,
  location_my text,
  description_en text,
  description_my text,
  image_url text,
  created_at timestamptz not null default now()
);

-- For databases created before this column existed, run once:
-- alter table public.events add column if not exists image_url text;

-- ---------- Editable site text ----------
create table if not exists public.site_content (
  key text primary key,
  value_en text not null default '',
  value_my text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------- Photo gallery ----------
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption_en text,
  caption_my text,
  created_at timestamptz not null default now()
);

-- ---------- Public image storage bucket ----------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Policies for storage.objects (uploads into the images bucket). Without
-- these, signed-in staff get "new row violates row-level security policy"
-- when uploading photos.
create policy "Public read images" on storage.objects
  for select using (bucket_id = 'images');
create policy "Staff upload images" on storage.objects
  for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Staff update images" on storage.objects
  for update using (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Staff delete images" on storage.objects
  for delete using (bucket_id = 'images' and auth.role() = 'authenticated');

-- ============================================================
-- Row Level Security
-- Visitors can read; only signed-in staff can write.
-- ============================================================
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.site_content enable row level security;
alter table public.gallery enable row level security;

create policy "Public read news" on public.news
  for select using (true);
create policy "Staff manage news" on public.news
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read events" on public.events
  for select using (true);
create policy "Staff manage events" on public.events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read site_content" on public.site_content
  for select using (true);
create policy "Staff manage site_content" on public.site_content
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Public read gallery" on public.gallery
  for select using (true);
create policy "Staff manage gallery" on public.gallery
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Seed the editable site text (edit later from the admin portal)
-- ============================================================
insert into public.site_content (key, value_en, value_my) values
  ('home_hero_badge', 'Hope International School', 'Hope အပြည်ပြည်ဆိုင်ရာ ကျောင်း'),
  ('home_hero_title', 'Nurturing Global Citizens, One Student at a Time', 'ကမ္ဘာ့နိုင်ငံသားကောင်းများကို ပြုစုပျိုးထောင်ခြင်း'),
  ('home_hero_subtitle', 'A world-class international education in Myanmar — from Early Years to High School, where students learn in English and Burmese, grow in confidence, and become caring leaders of tomorrow.', 'မြန်မာနိုင်ငံရှိ ကမ္ဘာ့အဆင့်မီ နိုင်ငံတကာပညာရေး — မူကြိုမှ အထက်တန်းအထိ၊ အင်္ဂလိပ်နှင့် မြန်မာဘာသာ နှစ်မျိုးလုံးဖြင့် သင်ယူပြီး ယုံကြည်မှု တည်ဆောက်ကာ နောင်တွင် ကြင်နာတတ်သော ခေါင်းဆောင်များ ဖြစ်လာစေရန် ပြုစုပေးပါသည်။'),
  ('home_welcome_title', 'Welcome to Our School', 'ကျောင်းမှ ကြိုဆိုပါသည်'),
  ('home_welcome_text', 'At Hope International School, we believe every child is unique. Our caring teachers, modern facilities and a balanced international curriculum help each student discover their strengths, think critically and act with kindness.', 'Hope အပြည်ပြည်ဆိုင်ရာကျောင်းတွင် ကလေးတိုင်းသည် ထူးခြားသည်ဟု ကျွန်ုပ်တို့ ယုံကြည်ပါသည်။ ဂရုစိုက်တတ်သော ဆရာ ဆရာမများ၊ ခေတ်မီသော သင်ကြားရေးအဆောက်အအုံများနှင့် မျှတသော နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းသည် ကျောင်းသားတိုင်း မိမိ၏ အရည်အချင်းများကို ရှာဖွေတွေ့ရှိနိုင်ရန် ကူညီပေးပါသည်။'),
  ('about_intro', 'Hope International School is a vibrant learning community in Myanmar where international standards meet local values.', 'Hope အပြည်ပြည်ဆိုင်ရာကျောင်းသည် နိုင်ငံတကာ စံနှုန်းများနှင့် ဒေသဆိုင်ရာ တန်ဖိုးများ ပေါင်းစပ်ထားသော မြန်မာနိုင်ငံရှိ တက်ကြွသော သင်ယူမှု အသိုင်းအဝိုင်းတစ်ခုဖြစ်သည်။'),
  ('academics_intro', 'Our curriculum blends international teaching standards with the best of Myanmar culture. Students learn to think deeply, ask questions and apply their knowledge to real life.', 'ကျွန်ုပ်တို့၏ သင်ရိုးညွှန်းတမ်းသည် နိုင်ငံတကာ သင်ကြားရေး စံနှုန်းများနှင့် မြန်မာ့ယဉ်ကျေးမှု၏ အကောင်းဆုံးအရာများကို ပေါင်းစပ်ထားသည်။ ကျောင်းသားများသည် နက်နက်ရှိုင်းရှိုင်း တွေးခေါ်တတ်ရန်၊ မေးခွန်းထုတ်တတ်ရန်နှင့် မိမိတို့၏ အသိပညာကို လက်တွေ့ဘဝတွင် အသုံးချတတ်ရန် သင်ယူကြသည်။')
on conflict (key) do nothing;

-- The Home, Academics, About and Footer page sections are stored here as
-- JSON in the rows home_stats, home_programs, home_cta, academics_curriculum,
-- academics_levels, academics_programs, about_mission_vision, about_values,
-- about_facts and footer_content. They are seeded from code defaults
-- (lib/fallback-data.ts) and are created in this table the first time staff
-- save them from the Admin portal → Home / About / Academics / Footer tab.