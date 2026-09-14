-- One-time migration: add the submissions inbox to a database that already
-- has the four content tables (idempotent — safe to run again).
--
-- Local:  npx wrangler d1 execute hope-db --local  --file worker/migrate-submissions.sql
-- Remote: npx wrangler d1 execute hope-db --remote --file worker/migrate-submissions.sql
--
-- (worker/schema.sql contains the same table, so fresh installs get it there.)

create table if not exists submissions (
  id text primary key,
  kind text not null,                -- 'inquiry' | 'registration' | 'application'
  data text not null default '{}',   -- JSON payload (form fields)
  cv_key text,                       -- R2 object key (applications only)
  ip text,                           -- short client fingerprint (abuse triage)
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists submissions_created_at_idx on submissions(kind, created_at desc);
