-- One-time repair (2026-09-14): the saved header_content / footer_content rows
-- predate the Carrier page and contain a dead /downloads link, so after the
-- AdminHeader "saved menu is authoritative" fix the site menu was missing
-- Carrier and Contact entirely (and still rendered /downloads, which the
-- Header also hides as an unknown path — so the dead row was silently dead
-- weight in the editor).
--
-- This migration:
--   1. removes any '/downloads' entry from the saved link arrays, and
--   2. appends the missing Carrier (/carrier) and Contact (/contact) links
--      when neither is present.
--
-- Safe to re-run: each statement's WHERE clause makes it a no-op once applied.
-- Only the two JSON menu rows are touched; every other site_content key is
-- left alone.

-- 1. Drop the dead /downloads link (no /downloads page exists on the site).
update site_content
   set value_en = json_set(
         value_en,
         '$.links',
         (select json_group_array(json(j.value))
            from json_each(site_content.value_en, '$.links') j
           where json_extract(j.value, '$.href') <> '/downloads')
       ),
       value_my = value_en,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 where key in ('header_content', 'footer_content')
   and exists (
     select 1 from json_each(site_content.value_en, '$.links') j
      where json_extract(j.value, '$.href') = '/downloads'
   );

-- 2. Append the Carrier link when it is absent, then the Contact link when
--    it is absent. (Per-link guards: if staff later delete one on purpose,
--    re-running this must not resurrect it — that was the original
--    AdminHeader merge bug.)
update site_content
   set value_en = json_insert(
         value_en,
         '$.links[#]',
         json('{"href":"/carrier","label_en":"Carrier","label_my":"အလုပ်အကိုင်"}')
       ),
       value_my = value_en,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 where key in ('header_content', 'footer_content')
   and not exists (
     select 1 from json_each(site_content.value_en, '$.links') j
      where json_extract(j.value, '$.href') = '/carrier'
   );

update site_content
   set value_en = json_insert(
         value_en,
         '$.links[#]',
         json('{"href":"/contact","label_en":"Contact","label_my":"ဆက်သွယ်ရန်"}')
       ),
       value_my = value_en,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 where key in ('header_content', 'footer_content')
   and not exists (
     select 1 from json_each(site_content.value_en, '$.links') j
      where json_extract(j.value, '$.href') = '/contact'
   );
