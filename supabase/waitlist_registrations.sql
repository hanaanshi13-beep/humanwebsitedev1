-- HUMAN waitlist: the table the /api/waitlist function writes to.
-- Reference copy of the schema prepared on 2026-11-20. The function (server/waitlist-core.ts) sends exactly these
-- column names. If the table in the Supabase project was created differently, compare it with this file:
-- a missing or renamed column makes every submission fail (the function logs the database's error code).
--
-- Run in the Supabase SQL editor. Safe to re-run on an empty project; review before running on one with data.

create extension if not exists citext;

create table if not exists public.waitlist_registrations (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),

  -- Chapter 02
  first_name              text not null check (char_length(first_name) between 1 and 80),
  age_group               text check (age_group in
                            ('18–24','25–34','35–44','45–54','55+','Prefer not to say')),   -- EN DASH, not a hyphen
  gender                  text check (gender in
                            ('Female','Male','Other / self-describe','Prefer not to say')),
  gender_self_described   text check (char_length(gender_self_described) <= 60),

  -- Chapter 03
  interests               text[] not null default '{}'
                            check (interests <@ array['preventive','fitness','hormonal','heart',
                              'energy','womens','mens','longevity','sleep','wellbeing']),

  -- Chapter 04
  email                   citext not null unique check (char_length(email) <= 254),
  mobile                  text check (mobile ~ '^\+\d{7,15}$'),
  city                    text check (char_length(city) <= 80),

  -- Consent record
  waitlist_consent        boolean not null check (waitlist_consent),
  consent_at_client       timestamptz,                      -- the visitor's own clock, if believable
  consent_at              timestamptz not null default now(), -- the database's clock: the record that counts
  privacy_notice_version  text not null,

  -- The same submission sent twice is stored once
  idempotency_key         uuid unique
);

-- Nobody reaches this table with the public (publishable / anon) key: row-level security is on and there is
-- deliberately no policy. Only the secret key, used by the server function, can write to it.
alter table public.waitlist_registrations enable row level security;

revoke all on public.waitlist_registrations from anon, authenticated;
grant insert, select on public.waitlist_registrations to service_role;

-- Checks to run after creating it:
--   select column_name, data_type from information_schema.columns
--     where table_schema = 'public' and table_name = 'waitlist_registrations' order by ordinal_position;
--   select relrowsecurity from pg_class where relname = 'waitlist_registrations';          -- expect: true
--   select count(*) from pg_policies where tablename = 'waitlist_registrations';           -- expect: 0
