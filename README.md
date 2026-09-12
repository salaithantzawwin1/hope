# Hope International School — Website

A bilingual (English + Burmese) website for an international school. The site
is **fully static** — `npm run build` produces a plain `out/` folder that runs
on any hosting (cPanel, shared hosting, GitHub Pages, Netlify, Vercel free
tier, …). No Node.js server is required on the host.

Editable content (news, events, gallery photos, hero/about text) is stored in
**Cloudflare D1** (SQLite) with photos in **Cloudflare R2**, served by the
same-origin Worker that hosts the static site. Changes made in the admin
portal appear on the public site immediately — no rebuild or re-upload.

## Features

- 🌐 **Bilingual**: `/en/...` and `/my/...` routes, language switcher, Noto
  Sans Myanmar font for correct Burmese rendering everywhere.
- 📄 **Pages**: Home, About, Academics, Admissions (steps, requirements, fees,
  inquiry form), News & Events.
- 🗞️ **News & Events**: managed from the admin portal (English + Burmese
  fields), with an article reader modal.
- 🖼️ **Photo gallery**: upload photos from the admin portal (auto-resized).
- 📞 **Contact page**: contact cards, Facebook/Telegram/Viber icon links and
  a Google Map — all editable from the portal.
- ✍️ **Editable site text**: hero, welcome and about intro editable from the
  portal.
- 🔐 **Admin portal** at `/admin` (staff passphrase login, signed session cookie).
- 📦 **Static export**: pages are plain static assets; the Worker serves the
  `/api/*` backend. Without D1/R2 configured the site still shows sample content.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · next-intl ·
Cloudflare Workers (D1 + R2)

## Development

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Building the static site

```bash
npm run build      # outputs the static site to ./out
```

To preview the production build locally:

```bash
npx serve out     # or: python -m http.server 8080 -d out
```

## Cloudflare backend setup (free tier)

The site shows sample content until the backend is connected. One-time setup:

1. `npx wrangler login`, then create the resources:

   ```bash
   npx wrangler d1 create hope-db        # put the returned id in wrangler.jsonc
   npx wrangler r2 bucket create hope-images
   npx wrangler d1 execute hope-db --remote --file worker/schema.sql
   ```

2. Set the admin secrets (`.dev.vars.example` documents local equivalents):

   ```bash
   npx wrangler secret put STAFF_PASSPHRASE   # shared /admin passphrase
   npx wrangler secret put SESSION_SECRET     # openssl rand -hex 32
   ```

3. Optional: connect a custom domain to the R2 bucket (dashboard → R2 →
   bucket → Settings → Public access) and set `IMAGE_PUBLIC_BASE_URL` in
   `wrangler.jsonc` `[vars]` (and `NEXT_PUBLIC_IMAGE_BASE_URL` in `.env.local`
   before a rebuild) so uploads return full URLs.

> Security note: all `/api/*` reads are public (like the old row-level
> security); every write requires the staff session cookie the Worker issues
> after a correct passphrase.

### Migrating existing content from Supabase (one-time)

If the old Supabase project still has data:

```bash
SUPABASE_URL=https://<proj>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
node scripts/export-supabase-to-d1.mjs            # writes scripts/d1-import.sql
npx wrangler d1 execute hope-db --remote --file scripts/d1-import.sql
```

Old photo URLs keep working (they still point at the Supabase bucket) until
you copy the objects to R2 and rewrite the URLs — see
`docs/cloudflare-migration-plan.md` §4.

## Deploying to cPanel / shared hosting

1. Run `npm run build` (on your computer).
2. Upload the **contents** of the `out/` folder to your hosting's web root
   (usually `public_html/`) with the File Manager or an FTP client.
3. Done — no server configuration needed.

Deploying again after code changes: rebuild and re-upload `out/`. Content
changes made in the admin portal do **not** require re-uploading.

> On cPanel, ensure the folder `out/admin/` is uploaded (the portal lives at
> `https://your-school.com/admin`).

### Deploying to Cloudflare (Workers static assets)

The repo includes a `wrangler.jsonc` that deploys the static `out/` folder
as a Cloudflare Worker (static assets) — no OpenNext needed, because the
site is a fully static export. Every push to `main` deploys automatically
when the Workers build runs:

- **Build command:** `npm run build` → produces `out/`
- **Deploy command:** `npx wrangler deploy` → uploads `out/`

Locally you can deploy or preview with `npm run deploy` / `npm run preview`
(after `npx wrangler login`).

## Backing up site content (admin saves → git history)

Content saved from the admin portal lives **only** in the production D1
database — git never sees it. Nightly snapshots fix that:

- **Automated:** `.github/workflows/d1-backup.yml` exports the production D1
  every night and commits the SQL to `backups/` (only when content actually
  changed). One-time setup: add a repo secret `CLOUDFLARE_API_TOKEN`
  (Account → Workers D1 → Edit) at GitHub → Settings → Secrets → Actions.
- **Manual:** `npm run backup:d1` writes `backups/d1-<timestamp>.sql` from
  your own machine (needs `npx wrangler login`).

Photos are **not** in these snapshots — they live in R2 and the SQL only
references them by key/URL, so a restore never touches R2 objects.

### Restoring content into a local project (after `git pull`)

```bash
npm run restore:d1
```

Loads `backups/latest.sql` into the **local** D1 (drops and recreates the
four content tables), so the local admin portal shows the same content the
production site serves. Production is never touched by this command.

### Restoring content into PRODUCTION

```bash
# 1. Overwrite-in-place (safe: rows with the same ids are replaced, existing
#    rows not in the snapshot are kept):
npx wrangler d1 execute hope-db --remote --file backups/latest.sql

# 2. Exact point-in-time restore (wipe, then reload — DESTRUCTIVE):
npx wrangler d1 execute hope-db --remote --command \
  "delete from news; delete from events; delete from gallery; delete from site_content;"
npx wrangler d1 execute hope-db --remote --file backups/latest.sql
```

The snapshot also contains `create table` statements — run
`worker/schema.sql` first only if the tables are missing entirely.

## Using the admin portal

1. Open `https://your-school.com/admin` and sign in with the staff
   passphrase (the `STAFF_PASSPHRASE` Worker secret).
2. **News** — add/edit/delete posts (title + body in English and Burmese,
   optional cover photo). New posts appear on the Home page and News page
   immediately.
3. **Events** — add/edit/delete upcoming events (date, time, location,
   description). Events are shown on the News page and Home page.
4. **Site Text** — edit the hero banner, welcome text and About/Academics
   intros in both languages. Click **Save All Changes** to publish.
5. **Home** — edit the Home page sections (hero stats, the Our Programs
   cards, and the CTA banner) in English and Burmese.
6. **About** — edit the Mission & Vision cards, the Core Values, and the
   School Facts stats in English and Burmese.
7. **Academics** — edit the Academics page sections (curriculum title, intro
   text and bullet points, the grade-level cards, and the Beyond the
   Classroom programmes) in English and Burmese.
8. **Gallery** — upload photos (previewed locally before publishing,
   auto-resized to 1600px JPEG) with bilingual captions, an optional
   **album** name, and an optional **album description** (English +
   Burmese). Photos are grouped by album on the **Gallery** page
   (`/en/gallery`), each album as its own titled section with the
   description shown on the cover card and album page. The **Edit Albums**
   panel renames or re-describes an album in one go (applied to every photo
   in it). Existing photos can be edited in place (captions and album) from
   the per-photo fields, and the list can be filtered by album or searched.
9. **Contact** — edit the Contact page (`/en/contact`): hero, the four
   contact cards (address, phone, email, opening hours), the social links
   (Facebook / Telegram / Viber / custom, each shown with its brand icon)
   and the **Google Map** embed URL (empty = map hidden).
10. **Footer** — edit the footer tagline, contact details (address, phone,
    email, opening hours) and the quick links navigation, in English and
    Burmese. Shown on every page.
11. **Header** — edit the logo image URL and the nav menu items (each with a
    URL and a bilingual label). The blue Admissions button is fixed. Shown
    on every page.

## Inquiry form

The **Send Us an Inquiry** form on the Admissions page sends automatically to
**iyfmyanmar.admin@gmail.com** through the same free **Google Apps Script**
pattern as the registration and job-application forms: each inquiry is logged
in a **Google Sheet** *and* emailed to the admin address (reply-to the
visitor, so staff can answer directly).

### One-time setup (≈5 minutes, free)

1. Open <https://sheets.new> and create a spreadsheet (any name).
2. **Extensions → Apps Script**, delete the sample code, paste the whole
   contents of `inquiry-emailer/Code.gs`, and save (💾).
3. At the top of the script, confirm `ADMIN_EMAIL` — this is the address
   that receives the inquiries (`iyfmyanmar.admin@gmail.com` by default).
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click **Deploy**, authorise the requested Google permissions, and copy
     the `/exec` URL it shows.
5. Paste that URL into `lib/inquiry.ts` as `INQUIRY_ENDPOINT`, then rebuild
   (`npm run build`) and deploy.

> Until `INQUIRY_ENDPOINT` is set, the form still works: it opens the
> visitor's email app with a pre-filled message addressed to
> `iyfmyanmar.admin@gmail.com` (the `INQUIRY_EMAIL` constant in
> `lib/inquiry.ts`).

### What happens on each submission

- A row is appended to the **Inquiries** sheet (time, locale, parent/guardian,
  email, phone, grade, message).
- An email with the inquiry is sent to `ADMIN_EMAIL` (reply-to the visitor's
  email address).
- If the email fails (daily Gmail quota), the inquiry is still saved in the
  Sheet — nothing is lost.

## Registration form

Registration is **event-based**: every event card on the News & Events page
(and the featured event on the home page) has a **Register** button that opens
the Register page with that event preselected and locked
(`/en/register?event=<event-id>`), showing the event's title, date and location
above the form. The **Register** entry is intentionally **not** in the nav
menu — visitors register *for an event*, not for a vague "register" page.

The site is fully static, so submissions are sent to a free **Google Apps
Script** web app which stores each entry in a **Google Sheet** and emails the
list as an **Excel (.xlsx) file** to the school.

### One-time setup (≈5 minutes, free)

1. Open <https://sheets.new> and create a spreadsheet (any name).
2. **Extensions → Apps Script**, delete the sample code, paste the whole
   contents of `registration-emailer/Code.gs`, and save (💾).
3. At the top of the script, confirm `ADMIN_EMAIL` — this is the address
   that receives the Excel list. **To change the email later, only edit this
   line** (and the `REGISTRATION_EMAIL` constant in `lib/registration.ts`).
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click **Deploy**, authorise the requested Google permissions, and copy
     the `/exec` URL it shows.
5. Paste that URL into `lib/registration.ts` as `REGISTRATION_ENDPOINT`, then
   rebuild (`npm run build`) and re-upload `out/`.

### What happens on each submission

- A row is appended to the **Registrations** sheet (columns: time, parent,
  email, phone, student, grade, event, **event id**, notes).
- The whole sheet is emailed to `ADMIN_EMAIL` as **hope-registrations.xlsx**.
- Staff can also email the file manually any time via the Sheet menu
  **Registrations → Send Excel to admin email**.

> Note: if the email fails (daily Gmail quota), the registration is still
> saved in the Sheet — nothing is lost.

## Job application form

The **Apply Now** button on the Carrier page opens a popup form (name,
phone, email, position, message and a **CV/Resume upload**). Submissions are
sent to the same kind of free Google Apps Script web app as the registration
form: each CV is saved to a **Google Drive folder** ("Hope Job
Applications"), the application is logged in a **Google Sheet**, and an email
with the CV attached is sent to `iyfmyanmar.admin@gmail.com`.

### One-time setup (≈5 minutes, free)

1. Open <https://sheets.new> and create a spreadsheet (any name).
2. **Extensions → Apps Script**, delete the sample code, paste the whole
   contents of `application-emailer/Code.gs`, and save (💾).
3. At the top of the script, confirm `ADMIN_EMAIL` — this is the address
   that receives the applications.
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click **Deploy**, authorise the requested Google permissions, and copy
     the `/exec` URL it shows.
5. Paste that URL into `lib/job-application.ts` as `APPLICATION_ENDPOINT`,
   then rebuild (`npm run build`) and re-upload `out/`.

### What happens on each application

- The CV is saved to the **Hope Job Applications** Drive folder (shareable
  link recorded in the Sheet).
- A row is appended to the **Applications** sheet (time, name, phone, email,
  position, notes, CV file + Drive link).
- The application is emailed to `ADMIN_EMAIL` **with the CV attached**, and
  replies go straight to the applicant (`Reply-To` is set to their email).
- If the email fails (daily Gmail quota), the CV is still in Drive and the
  row is still in the Sheet — nothing is lost.

> Until `APPLICATION_ENDPOINT` is set, the popup shows a friendly error with
> a direct `mailto:` link so no applicant is turned away.

## Customization

- **School name / contact details**: edit `messages/en.json` and
  `messages/my.json` (footer contact, address, phone, email) and
  `components/Header.tsx` / `components/Footer.tsx`.
- **Colors**: edit the `@theme` block in `app/globals.css`
  (`--color-brand`, `--color-accent`, …).
- **Fees, curriculum, admission steps**: static text in
  `messages/en.json` / `messages/my.json`.

## Project structure

```
app/
  [locale]/          public pages (en + my)
  admin/             admin portal (staff login + editors)
  page.tsx           root redirect (language detection)
components/
  admin/             portal editor components
  Header, Footer, ...i18n/                 next-intl routing + request config
lib/                  api client, db helpers, uploads, types
worker/               Worker entry, auth, /api routes, D1 schema
messages/             en.json + my.json (all UI copy)
registration-emailer/ Google Apps Script for the registration form
application-emailer/  Google Apps Script for the job application form
```

## Troubleshooting

- **Burmese looks broken on Windows/Android** — the Noto Sans Myanmar font is
  bundled at build time; hard-refresh (Ctrl+F5) after deploying.
- **News/events not loading** — the Worker API is unreachable: check the
  deploy logs, confirm `wrangler.jsonc` has the real `database_id`, and that
  `worker/schema.sql` was applied (`wrangler d1 execute hope-db --remote
  --file worker/schema.sql`). Without the API the pages fall back to sample
  content.
- **Login fails** — the `STAFF_PASSPHRASE` secret must be set on the Worker
  (`npx wrangler secret put STAFF_PASSPHRASE`); the passphrase is
  case-sensitive.