-- Question-Answers schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists questionnaires (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaires(id) on delete cascade,
  libelle text not null,
  type text not null check (type in ('radio', 'checkbox', 'select')),
  options jsonb not null default '[]'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists questions_questionnaire_id_idx on questions(questionnaire_id);

-- One row per visitor submission (covers every questionnaire answered in that visit).
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text not null,
  open_answer text,
  created_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  -- string for radio/select, array of strings for checkbox
  value jsonb not null
);

create index if not exists answers_submission_id_idx on answers(submission_id);
create index if not exists answers_question_id_idx on answers(question_id);
