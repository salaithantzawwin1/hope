# Hope International School — Website

A bilingual (English + Burmese) website for an international school. The site
is **fully static** — `npm run build` produces a plain `out/` folder that runs
on any hosting (cPanel, shared hosting, GitHub Pages, Netlify, Vercel free
tier, …). No Node.js server is required on the host.

Editable content (news, events, gallery photos, hero/about text) is stored in
a free **Supabase** cloud project and loaded by the site. Changes made in the
admin portal appear on the public site immediately — no rebuild or re-upload.

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
- 🔐 **Admin portal** at `/admin` (Supabase Auth login, staff accounts).
- 📦 **Static export**: works on any hosting; Supabase is optional — without
  it the site shows sample content.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · next-intl ·
Supabase (@supabase/supabase-js)

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

## Supabase setup (free)

The site shows sample content until you connect Supabase. Steps:

1. Create a free project at <https://supabase.com> (no credit card needed).
2. In **SQL Editor**, paste the contents of `supabase/schema.sql` and run it.
   This creates the `news`, `events`, `site_content` and `gallery` tables,
   the public `images` storage bucket, row-level security, and seed text.
3. In **Authentication → Users**, click **Add user** → **Create new user**
   and create each staff account (email + password).
4. In **Project Settings → API**, copy the **Project URL** and the **anon
   public** key.
5. Create a file named `.env.local` in the project root (see
   `.env.local.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

6. Rebuild: `npm run build`.

> Security note: only the anon (public) key is used by the site. Row-level
> security means visitors can read content but only signed-in staff can
> create or edit it.

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

## Using the admin portal

1. Open `https://your-school.com/admin` and sign in with a staff account
   created in Supabase.
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

The admissions form opens the visitor's email app with a pre-filled message
to `admissions@hopeinternationalschool.com` — no backend needed, works everywhere.

For automatic delivery to your inbox (or a form database), replace it with a
free form service such as:

- **FormSubmit** — add `https://formsubmit.co/ajax/your@email.com` as the form
  action; see <https://formsubmit.co> for the one-line setup.
- **Formspree** — create a free form at <https://formspree.io> and point the
  form's `action` to its endpoint.

The form lives in `components/InquiryForm.tsx`.

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
lib/                  supabase client, db helpers, uploads, types
messages/             en.json + my.json (all UI copy)
registration-emailer/ Google Apps Script for the registration form
application-emailer/  Google Apps Script for the job application form
supabase/schema.sql  one-click Supabase setup
```

## Troubleshooting

- **Burmese looks broken on Windows/Android** — the Noto Sans Myanmar font is
  bundled at build time; hard-refresh (Ctrl+F5) after deploying.
- **News/events not loading** — check the browser console for Supabase
  errors, confirm the SQL ran, and that `.env.local` was set *before* the
  build (env vars are baked in at build time).
- **Login fails** — the staff user must exist under Supabase
  Authentication → Users, and email/password must match.