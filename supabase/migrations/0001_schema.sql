-- =====================================================================
-- IoT LAB ESATIC — Migration 0001 : schéma de base
-- À exécuter dans Supabase > SQL Editor (ou via `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Types énumérés ----------
create type public.user_role      as enum ('student', 'trainer', 'admin');
create type public.course_level   as enum ('debutant', 'intermediaire', 'avance');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.exercise_kind  as enum ('practice', 'quiz');
create type public.review_status  as enum ('submitted', 'reviewed');
create type public.challenge_status as enum ('draft', 'published', 'closed');

-- ---------- Fonction utilitaire : updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  bio         text,
  filiere     text,
  promotion   text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription.
-- Le rôle est TOUJOURS 'student' : on ignore tout rôle envoyé par le navigateur.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'student');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- categories ----------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- courses ----------
create table public.courses (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  description      text not null default '',
  image_url        text,
  level            public.course_level not null default 'debutant',
  category_id      uuid references public.categories(id) on delete set null,
  duration_minutes int  not null default 0 check (duration_minutes >= 0),
  skills           text[] not null default '{}',
  prerequisites    text,
  instructor_id    uuid references public.profiles(id) on delete set null,
  status           public.publish_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index courses_category_idx on public.courses(category_id);
create index courses_status_idx   on public.courses(status);
create trigger courses_updated before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------- lessons ----------
create table public.lessons (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  module_position int  not null default 1,
  module_title    text not null default '',
  position        int  not null default 1,        -- ordre global dans la formation
  slug            text not null,
  title           text not null,
  intro           text not null default '',
  objectives      text[] not null default '{}',
  content_md      text not null default '',       -- contenu en Markdown simplifié
  video_url       text,
  wokwi_url       text,
  duration_minutes int not null default 10,
  published       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, position)
);
create trigger lessons_updated before update on public.lessons
  for each row execute function public.set_updated_at();

-- ---------- enrollments ----------
create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ---------- lesson_progress ----------
create table public.lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------- exercises ----------
create table public.exercises (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.courses(id) on delete cascade,
  lesson_id           uuid references public.lessons(id) on delete set null,
  position            int not null default 1,
  kind                public.exercise_kind not null default 'practice',
  title               text not null,
  instructions_md     text not null default '',
  components          text[] not null default '{}',   -- matériel / composants nécessaires
  wiring_md           text,                           -- schéma de câblage (texte)
  starter_code        text,
  wokwi_url           text,
  requires_submission boolean not null default true,
  published           boolean not null default true,
  -- Quiz : liste de questions SANS les réponses : [{id, question, options:[...]}]
  quiz                jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index exercises_course_idx on public.exercises(course_id);
create trigger exercises_updated before update on public.exercises
  for each row execute function public.set_updated_at();

-- Réponses des quiz : table séparée, illisible pour les étudiants.
create table public.exercise_answers (
  exercise_id uuid primary key references public.exercises(id) on delete cascade,
  answers     jsonb not null      -- {"q1": 2, "q2": 0, ...} index de la bonne option
);

-- ---------- challenges ----------
create table public.challenges (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  level           public.course_level not null default 'debutant',
  starts_at       timestamptz,
  ends_at         timestamptz,
  objectives      text[] not null default '{}',
  instructions_md text not null default '',
  resources       jsonb not null default '[]',   -- [{label, url}]
  status          public.challenge_status not null default 'draft',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create trigger challenges_updated before update on public.challenges
  for each row execute function public.set_updated_at();

-- ---------- submissions (exercices ET challenges) ----------
create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  exercise_id  uuid references public.exercises(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete cascade,
  content      text,            -- explication / code
  link_url     text,            -- lien vers la simulation Wokwi, un dépôt, etc.
  file_path    text,            -- chemin dans le bucket privé "submissions"
  status       public.review_status not null default 'submitted',
  score        numeric(5,2),
  feedback     text,
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- une soumission appartient soit à un exercice, soit à un challenge
  check ((exercise_id is not null)::int + (challenge_id is not null)::int = 1)
);
create index submissions_user_idx      on public.submissions(user_id);
create index submissions_exercise_idx  on public.submissions(exercise_id);
create index submissions_challenge_idx on public.submissions(challenge_id);
create trigger submissions_updated before update on public.submissions
  for each row execute function public.set_updated_at();

-- ---------- challenge_results ----------
create table public.challenge_results (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete set null,
  score         numeric(5,2),
  feedback      text,
  awarded_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (challenge_id, user_id)
);

-- ---------- tools ----------
create table public.tools (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text not null default '',
  category     text not null default 'Autre',
  logo_url     text,
  official_url text not null,
  usefulness   text,              -- à quoi sert l'outil pour un étudiant IoT
  tutorial_url text,
  position     int not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger tools_updated before update on public.tools
  for each row execute function public.set_updated_at();
