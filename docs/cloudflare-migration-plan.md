# Migration plan: Supabase → Cloudflare (D1 + R2)

> **TL;DR (မြန်မာလို):** ပုံများ တစ်ဆိုင်းနဲ့ များလာတဲ့အခါ Supabase free tier ရဲ့ **1 GB storage** နဲ့ **5 GB/month bandwidth** က ပထမဆုံး ပြဿနာ ဖြစ်လာမယ်။ Cloudflare R2 က **10 GB storage + bandwidth အခမဲ့** ပေးတယ်။ ဒါကြောင့် အဆင့် ၃ ဆင့် ခွဲပြီး ရွှေ့မယ် —
> ၁) ပုံတွေကို R2 ကို ရွှေ့၊ ၂) အချက်အလက်တွေကို D1 ကို ရွှေ့၊ ၃) Supabase ကို လုံးဝ ဖျက် (login ကို Cloudflare Access နဲ့)။
> တစ်ဆင့်ပြီးတစ်ဆင့် လုပ်ရင် site က ဘယ်တုန်းကမှ မပျက်ဘဲ အလုပ်လုပ်နေမယ်။

---

## 1. Why migrate

Current stack: fully static Next.js export on a Cloudflare Worker (static assets), with
Supabase providing three things:

1. **Auth** — staff logins for `/admin`
2. **Database** — `news`, `events`, `site_content`, `gallery` tables (Postgres)
3. **Storage** — the public `images` bucket for gallery/news/event photos

Free-tier comparison (the numbers that matter as the gallery grows):

| | Supabase free | Cloudflare free |
|---|---|---|
| Image storage | **1 GB** hard cap | **10 GB** (R2) |
| Bandwidth | 5 GB/month, then paid | **Unlimited egress** on R2 |
| Database | 500 MB Postgres | D1: 5 GB, 5M row reads/day |
| Inactivity | Project pauses after ~1 week idle | Never pauses |
| Requests | — | 100k Worker requests/day |

The 1 GB storage cap is the first wall; R2 gives 10× that with no egress bill.
The rows themselves (news/events/captions) are tiny — D1 is more than enough.

## 2. Target architecture

```
                    ┌─────────────────────────────────────┐
                    │        Cloudflare Worker            │
                    │  (same Worker as today)             │
                    │                                     │
  /en, /my, /admin ─┼─▶ static assets (out/)              │   unchanged
  /api/*          ──┼─▶ Worker code (run_worker_first)    │   NEW
                    │     ├─ /api/images  → R2 binding    │
                    │     ├─ /api/news    → D1 binding    │
                    │     ├─ /api/events  → D1 binding    │
                    │     ├─ /api/gallery → D1 binding    │
                    │     └─ /api/content → D1 binding    │
                    └─────────────────────────────────────┘
```

Key properties:

- **Same-origin API** — no CORS configuration, no new domain to secure.
- **One deploy unit** — `wrangler.jsonc` gains `main`, `d1_databases`, `r2_buckets`;
  the deploy command stays `npx wrangler deploy`.
- **Graceful degradation preserved** — the fallback-data behaviour stays; the
  fetch layer simply returns fallbacks when the API is unreachable (same as
  today when Supabase env vars are missing).
- Images are served from R2 via a **custom domain on the same zone**
  (e.g. `images.hopeinternationalschool.com`). `r2.dev` public URLs exist but
  are rate-limited and not meant for production.

## 3. Phase 0 — groundwork (no behavior change)

1. `npx wrangler login` (not currently authenticated on this machine), then:
   ```bash
   npx wrangler d1 create hope-db          # note the database_id
   npx wrangler r2 bucket create hope-images
   ```
2. Extend `wrangler.jsonc` (Worker code exists but only `/api/*` matches run it):
   ```jsonc
   {
     "name": "hope",
     "main": "worker/index.ts",
     "compatibility_date": "2026-09-08",
     "d1_databases": [
       { "binding": "DB", "database_name": "hope-db", "database_id": "<from create>" }
     ],
     "r2_buckets": [
       { "binding": "IMAGES", "bucket_name": "hope-images" }
     ],
     "assets": {
       "directory": "./out",
       "not_found_handling": "404-page",
       "html_handling": "auto-trailing-slash",
       "run_worker_first": ["/api/*"]
     }
   }
   ```
   Adding `main` without any routes the assets would have served is safe:
   every non-`/api` request still goes to static assets.
3. Local dev gets D1 + R2 for free via `wrangler dev` (Miniflare simulates both,
   so `npm run preview` works offline). Seed local D1 with
   `npx wrangler d1 execute hope-db --local --file worker/schema.sql`.

## 4. Phase 1 — R2 for images (biggest win, least invasive)

Supabase keeps doing auth + all text data. Only photos move.

### Worker API

| Route | Method | Auth | Behaviour |
|---|---|---|---|
| `/api/images` | GET | public | list objects (key, size, uploaded) |
| `/api/images` | PUT | staff | body = binary; stores as `folder/timestamp-rand.jpg` |
| `/api/images?key=…` | DELETE | staff | deletes object |

Auth during Phases 1–2: verify the Supabase access token the admin portal
already holds — HS256, signed with the project's JWT secret (set as a Worker
secret: `npx wrangler secret put SUPABASE_JWT_SECRET`). WebCrypto `verify()`
in the Worker; no new dependency.

### Code touch-points

- `lib/upload.ts` — `uploadImage()` switches from `supabase.storage.upload` to
  `fetch("/api/images", { method: "PUT", body: resized })`. The client-side
  resize (1600 px JPEG) stays — it's still the right first line of defense.
- Admin components (`AdminNews`, `AdminGallery`, `AdminEvents`) — no change;
  they only call `uploadImage()`.
- `publicImageUrl()` in `lib/db.ts` — new prefix, e.g.
  `https://images.hopeinternationalschool.com/<path>`.
- R2 public access: connect the bucket to the custom domain once in the
  dashboard (R2 → bucket → Settings → Public access), or serve through the
  Worker with a cache rule.

### One-time data migration (existing photos)

Script `scripts/migrate-images-to-r2.mjs`:

1. List all objects in Supabase Storage bucket `images` (S3-compatible REST or
   the storage API with the service-role key, run locally only).
2. Download each object, `PUT` into R2 (via the S3 API with R2 credentials —
   create them in dashboard → R2 → Manage API tokens).
3. Rewrite DB URLs (order matters: storage first, then SQL):
   ```sql
   update news   set image_url = replace(image_url, 'https://<proj>.supabase.co/storage/v1/object/public/images/', 'https://images.hopeinternationalschool.com/');
   -- same for events.image_url and gallery.image_url
   ```
4. Spot-check the site, then **keep the Supabase bucket for one release cycle
   as a free rollback** before emptying it.

**Exit criteria:** gallery/news images load from R2; admin upload works;
old URLs rewritten. Nothing else changed.

## 5. Phase 2 — D1 for data

### Schema (port of `supabase/schema.sql`, SQLite dialect)

```sql
create table if not exists news (
  id text primary key,
  title_en text not null default '',
  title_my text not null default '',
  body_en text not null default '',
  body_my text not null default '',
  image_url text,
  published_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

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
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists events_date_idx on events(date);

create table if not exists site_content (
  key text primary key,
  value_en text not null default '',
  value_my text not null default '',
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists gallery (
  id text primary key,
  image_url text not null,
  caption_en text,
  caption_my text,
  album_en text,
  album_my text,
  album_desc_en text,
  album_desc_my text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

Notes: `uuid` → `text` ids generated with `crypto.randomUUID()` in the Worker
(matches the JSON the site already consumes); `timestamptz` → ISO text
(sort order is identical); `date` → `text` (`YYYY-MM-DD`, same as today's
`.gte("date", today)` comparisons via `WHERE date >= ?1`).

### Worker API

| Route | Methods | Auth |
|---|---|---|
| `/api/news` | GET (public, newest 20), POST/PUT/DELETE (staff) |
| `/api/events` | GET (public, `date >= today`), POST/PUT/DELETE (staff) |
| `/api/gallery` | GET (public, newest 50), POST/DELETE (staff), DELETE batch by ids |
| `/api/content` | GET (public, full map), PUT per key (staff) |

Admin write routes are protected the same way as Phase 1 (Supabase JWT until
Phase 3). Reads are public, mirroring today's RLS.

### Code touch-points

- New `lib/api.ts` — typed `fetch` wrappers returning the same shapes
  (`NewsItem[]`, `EventItem[]`, …) plus the same try/catch-fallback behaviour
  as today.
- `lib/db.ts` — `fetchNews/fetchEvents/fetchGallery/fetchSiteContent` delegate
  to `lib/api.ts` (signatures unchanged → **zero changes** in
  `NewsEventsPage`, `Gallery`, `FeaturedEvent`, etc.).
- Admin components — the ~10 direct `supabase.from(...)` call sites
  (`AdminNews:105`, `AdminNews:124`, `AdminEvents:123,142`,
  `AdminGallery:120,169,223`, `AdminSiteContent:43,78`, `AdminCarrier:72`,
  `AdminContact:63`, `AdminFooter:57`, `AdminHeader:61`) move to `lib/api.ts`
  mutators. Mechanical, component structure untouched.
- Data migration: export each Supabase table to JSON (service-role key, local
  script), load with `npx wrangler d1 execute hope-db --remote --command`
  batches or a small import script. Ids are preserved so existing
  `/register?event=<id>` links keep working.

**Exit criteria:** public pages and the whole admin portal run against D1;
Supabase still owns login only.

## 6. Phase 3 — leave Supabase (all-Cloudflare auth)

Decision made: end state is **no Supabase at all**. Recommended mechanism:

- **Cloudflare Access** (Zero Trust, free up to 50 users) on `/admin*` and
  `/api/*` write routes: email OTP for each staff member — zero custom auth
  code, MFA for free, and the static `/admin` page needs no changes (Access
  sits in front of it at the edge). The Worker then trusts the signed
  `Cf-Access-Jwt-Assertion` header instead of Supabase JWTs.
- Fallback if Access feels like overkill: a single staff passphrase checked in
  the Worker (secret binding) issuing an HMAC-signed session cookie. ~50 lines,
  but you own the security.

Phase-3 checklist:

1. Remove `lib/supabase.ts`, `@supabase/supabase-js` dependency, and the
   Supabase JWT verification from the Worker; swap in the Access JWT check
   (`teamDomain`/`aud` claim validation).
2. `/admin` login screen becomes "continue with email OTP" (Access redirect)
   — or is bypassed entirely behind Access.
3. Delete the Supabase project (after a final `pg_dump`/JSON export archived
   in the repo or Drive).
4. `supabase/schema.sql` stays in git history only; `worker/schema.sql` is the
   source of truth going forward.

## 7. Rollback strategy (why phase-by-phase is safe)

- **Phase 1** — old Supabase image URLs keep working until we empty the
  bucket; reverting = point `publicImageUrl` back and redeploy (one commit).
- **Phase 2** — Supabase remains the live DB until the cutover commit; D1 is
  recreated from scratch any time via the import script. Reverting = one
  commit (the fetch layer falls back gracefully even if API routes vanish).
- **Phase 3** — only after 1–2 in Phase 2 are stable; Supabase project is
  deleted last, after a full export.

Each phase is independently deployable and reversible; the site never
depends on two backends at once at runtime.

## 8. Free-tier budget after migration

- Storage: R2 10 GB ≈ ~3,000+ photos at the 1600 px resize (~300 KB avg) —
  ~10× today's cap, and overage is $0.015/GB-month, not a hard stop.
- Bandwidth: unlimited egress (the 5 GB Supabase ceiling disappears).
- D1: ~5 GB / 5M row-reads per day — a school site with a handful of editors
  will use a rounding error of this.
- Workers: 100k requests/day; the static pages served from assets don't count
  as Worker requests (only `/api/*` does).

## 9. What I need from you at each phase start

| Phase | Action needed |
|---|---|
| 0/1 | `npx wrangler login` + create D1/R2 (or approve me running the create commands once logged in) |
| 1 | R2 custom-domain click in the dashboard (or I use a Worker route instead — no click needed) |
| 1 | Supabase service-role key, used **locally only** for the one-time copy |
| 2 | Same D1 access; data import run |
| 3 | Cloudflare Zero Trust (Access) setup in the dashboard; final Supabase export + delete |
