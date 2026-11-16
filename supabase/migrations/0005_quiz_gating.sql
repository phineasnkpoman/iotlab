-- =====================================================================
-- IoT LAB ESATIC — Migration 0005 : QCM de fin de leçon
-- À exécuter APRÈS 0004_submissions_files.sql. Relançable sans risque.
--
-- 1. Un QCM peut être « obligatoire » : la leçon ne peut être marquée terminée
--    que si l'apprenant l'a réussi (score >= pass_score). La règle est imposée
--    par un trigger dans la base, pas seulement par l'interface.
-- 2. Chaque question peut avoir une explication, stockée avec les bonnes réponses
--    (table exercise_answers, illisible par les apprenants). La correction
--    expliquée n'est renvoyée qu'une fois le QCM réussi.
-- =====================================================================

alter table public.exercises
  add column if not exists required   boolean not null default false,
  add column if not exists pass_score int     not null default 70;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exercises_pass_score_range') then
    alter table public.exercises
      add constraint exercises_pass_score_range check (pass_score between 0 and 100);
  end if;
end $$;

-- {"q1": "Pourquoi cette réponse est la bonne", ...}
alter table public.exercise_answers
  add column if not exists explanations jsonb;

-- Correction : renvoie la réussite, les questions ratées (sans les bonnes réponses),
-- et, seulement si le QCM est réussi, le corrigé expliqué de chaque question.
create or replace function public.grade_quiz(p_exercise_id uuid, p_choices jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  expected jsonb; notes jsonb; total int; good int := 0; k text; pct numeric(5,2); sub_id uuid;
  need int; wrong text[] := '{}'; passed boolean; correction jsonb := null;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if p_choices is null or jsonb_typeof(p_choices) <> 'object' then raise exception 'Réponses invalides'; end if;

  select e.pass_score into need
  from public.exercises e join public.courses c on c.id = e.course_id
  where e.id = p_exercise_id and e.kind = 'quiz' and e.published and c.status = 'published';
  if need is null then raise exception 'Quiz introuvable'; end if;

  select a.answers, a.explanations into expected, notes
  from public.exercise_answers a where a.exercise_id = p_exercise_id;
  if expected is null then raise exception 'Quiz non configuré'; end if;

  select count(*) into total from jsonb_object_keys(expected);
  for k in select jsonb_object_keys(expected) order by 1 loop
    if jsonb_typeof(p_choices -> k) = 'number' and (p_choices ->> k) ~ '^\d{1,2}$'
       and (p_choices ->> k)::int = (expected ->> k)::int then
      good := good + 1;
    else
      wrong := wrong || k;
    end if;
  end loop;
  pct := round(100.0 * good / nullif(total, 0), 2);
  passed := coalesce(pct >= need, false);

  if passed then
    select jsonb_object_agg(q, jsonb_build_object('answer', (expected ->> q)::int, 'explanation', notes ->> q))
      into correction
    from jsonb_object_keys(expected) as q;
  end if;

  -- Note automatique : status « reviewed », reviewed_by vide (aucun correcteur humain).
  insert into public.submissions (user_id, exercise_id, content, status, score, reviewed_at)
  values (auth.uid(), p_exercise_id, p_choices::text, 'reviewed', pct, now())
  returning id into sub_id;

  return jsonb_build_object('submission_id', sub_id, 'correct', good, 'total', total,
                            'score', pct, 'pass_score', need, 'passed', passed,
                            'wrong', to_jsonb(wrong), 'correction', correction);
end $$;
revoke all on function public.grade_quiz(uuid, jsonb) from public, anon;
grant execute on function public.grade_quiz(uuid, jsonb) to authenticated;

-- Refus d'enregistrer une leçon terminée tant qu'un QCM obligatoire n'est pas réussi.
-- Exécuté avec les droits de l'appelant : il ne lit que ses propres soumissions.
create or replace function public.require_passed_quizzes()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (
    select 1 from public.exercises e
    where e.lesson_id = new.lesson_id and e.kind = 'quiz' and e.required and e.published
      and not exists (
        select 1 from public.submissions s
        where s.user_id = new.user_id and s.exercise_id = e.id and s.score >= e.pass_score)
  ) then
    raise exception 'QCM obligatoire non validé pour cette leçon';
  end if;
  return new;
end $$;

drop trigger if exists lesson_progress_require_quiz on public.lesson_progress;
create trigger lesson_progress_require_quiz before insert on public.lesson_progress
  for each row execute function public.require_passed_quizzes();

-- Accès rapide aux meilleurs scores d'un apprenant sur un QCM.
create index if not exists submissions_user_exercise_idx on public.submissions (user_id, exercise_id);
