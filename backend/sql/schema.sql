-- Question-Answers schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists questionnaires (
  id uuid primary key default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Idempotent: drops title/description if this table was created before
-- questionnaires stopped needing a name (safe no-op otherwise).
alter table questionnaires drop column if exists title;
alter table questionnaires drop column if exists description;

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaires(id) on delete cascade,
  libelle text not null,
  type text not null check (type in ('radio', 'checkbox', 'select')),
  -- array of { value: string, is_other: boolean }; is_other marks the
  -- "Autre / Hafa"-style option that shows a free-text input when chosen
  options jsonb not null default '[]'::jsonb,
  position int not null default 0,
  is_explanation boolean not null default false,
  created_at timestamptz not null default now()
);

-- Idempotent: adds is_explanation if this table predates the explanation feature.
alter table questions add column if not exists is_explanation boolean not null default false;

create index if not exists questions_questionnaire_id_idx on questions(questionnaire_id);

-- One row per visitor submission (covers every questionnaire answered in that visit).
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  open_answer text,
  created_at timestamptz not null default now()
);

-- Migration: if the `submissions` table already exists with an `email` column
-- (from before the email field was dropped from the survey), run:
-- alter table submissions drop column if exists email;

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  -- string for radio/select, array of strings for checkbox
  value jsonb not null,
  -- optional free-text explanation of the chosen answer (questions.is_explanation)
  explanation text
);

-- Idempotent: adds explanation if this table predates the explanation feature.
alter table answers add column if not exists explanation text;

create index if not exists answers_submission_id_idx on answers(submission_id);
create index if not exists answers_question_id_idx on answers(question_id);
