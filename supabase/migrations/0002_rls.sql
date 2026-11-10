-- =====================================================================
-- IoT LAB ESATIC — Migration 0002 : sécurité (RLS), stockage, quiz
-- =====================================================================

-- ---------- Fonctions d'aide aux rôles (lues dans la base, jamais dans le navigateur) ----------
create or replace function public.current_role_name()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_trainer()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('trainer','admin') from public.profiles where id = auth.uid()), false)
$$;

-- Le formateur est-il responsable de cette formation ? (ou admin)
create or replace function public.can_manage_course(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or exists (select 1 from public.courses c
                 where c.id = cid and c.instructor_id = auth.uid() and public.is_trainer())
$$;

-- ---------- Protection du rôle : personne ne peut s'auto-promouvoir ----------
-- IMPORTANT : pas de "security definer" ici, sinon current_user vaudrait toujours le propriétaire
-- de la fonction (postgres) et la protection serait contournable.
create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.role is distinct from old.role
     and not (public.is_admin() or current_user in ('postgres', 'supabase_admin', 'service_role')) then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------- Protection des champs de correction des soumissions ----------
create or replace function public.protect_submission_review()
returns trigger language plpgsql set search_path = public as $$
declare can_review boolean;
begin
  can_review := public.is_admin() or current_user in ('postgres','supabase_admin','service_role')
    or (public.is_trainer() and (
         (new.exercise_id  is not null and exists (select 1 from public.exercises e where e.id = new.exercise_id and public.can_manage_course(e.course_id)))
      or (new.challenge_id is not null and exists (select 1 from public.challenges c where c.id = new.challenge_id and c.created_by = auth.uid()))
       ));
  if not can_review and (
       new.score is distinct from old.score or new.feedback is distinct from old.feedback
    or new.status is distinct from old.status or new.reviewed_by is distinct from old.reviewed_by
    or new.user_id is distinct from old.user_id) then
    raise exception 'Seul un formateur autorisé peut corriger une soumission';
  end if;
  return new;
end $$;
create trigger submissions_protect_review before update on public.submissions
  for each row execute function public.protect_submission_review();

-- ---------- Activation de la RLS sur TOUTES les tables ----------
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.courses           enable row level security;
alter table public.lessons           enable row level security;
alter table public.enrollments       enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.exercises         enable row level security;
alter table public.exercise_answers  enable row level security;
alter table public.submissions       enable row level security;
alter table public.challenges        enable row level security;
alter table public.challenge_results enable row level security;
alter table public.tools             enable row level security;

-- ---------- profiles ----------
create policy "profiles: lecture de son profil"   on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_trainer());
create policy "profiles: modification de son profil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin modifie tout"      on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Pas de politique INSERT/DELETE : le profil est créé par le trigger, supprimé en cascade.

-- ---------- categories ----------
create policy "categories: lecture publique" on public.categories for select to anon, authenticated using (true);
create policy "categories: admin écrit"      on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- courses ----------
create policy "courses: lecture publiée" on public.courses for select to anon, authenticated
  using (status = 'published');
create policy "courses: lecture formateur/admin" on public.courses for select to authenticated
  using (public.is_admin() or (instructor_id = auth.uid() and public.is_trainer()));
create policy "courses: création" on public.courses for insert to authenticated
  with check (public.is_admin() or (public.is_trainer() and instructor_id = auth.uid()));
create policy "courses: modification" on public.courses for update to authenticated
  using (public.is_admin() or (instructor_id = auth.uid() and public.is_trainer()))
  with check (public.is_admin() or (public.is_trainer() and instructor_id = auth.uid()));
create policy "courses: suppression admin" on public.courses for delete to authenticated
  using (public.is_admin());

-- ---------- lessons ----------
create policy "lessons: lecture publiée" on public.lessons for select to anon, authenticated
  using (published and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "lessons: lecture gestionnaire" on public.lessons for select to authenticated
  using (public.can_manage_course(course_id));
create policy "lessons: écriture gestionnaire" on public.lessons for all to authenticated
  using (public.can_manage_course(course_id)) with check (public.can_manage_course(course_id));

-- ---------- enrollments ----------
create policy "enrollments: les miennes" on public.enrollments for select to authenticated
  using (user_id = auth.uid() or public.can_manage_course(course_id));
create policy "enrollments: je m'inscris" on public.enrollments for insert to authenticated
  with check (user_id = auth.uid()
    and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "enrollments: je me désinscris" on public.enrollments for delete to authenticated
  using (user_id = auth.uid());

-- ---------- lesson_progress ----------
create policy "progress: lecture" on public.lesson_progress for select to authenticated
  using (user_id = auth.uid()
    or exists (select 1 from public.lessons l where l.id = lesson_id and public.can_manage_course(l.course_id)));
create policy "progress: j'enregistre" on public.lesson_progress for insert to authenticated
  with check (user_id = auth.uid()
    and exists (select 1 from public.lessons l join public.courses c on c.id = l.course_id
                where l.id = lesson_id and c.status = 'published'));
create policy "progress: j'annule" on public.lesson_progress for delete to authenticated
  using (user_id = auth.uid());

-- ---------- exercises ----------
create policy "exercises: lecture publiée" on public.exercises for select to anon, authenticated
  using (published and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "exercises: lecture gestionnaire" on public.exercises for select to authenticated
  using (public.can_manage_course(course_id));
create policy "exercises: écriture gestionnaire" on public.exercises for all to authenticated
  using (public.can_manage_course(course_id)) with check (public.can_manage_course(course_id));

-- ---------- exercise_answers : jamais lisible par les étudiants ----------
create policy "answers: gestionnaire seulement" on public.exercise_answers for all to authenticated
  using (exists (select 1 from public.exercises e where e.id = exercise_id and public.can_manage_course(e.course_id)))
  with check (exists (select 1 from public.exercises e where e.id = exercise_id and public.can_manage_course(e.course_id)));

-- ---------- submissions ----------
create policy "submissions: lecture" on public.submissions for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (public.is_trainer() and (
          (exercise_id  is not null and exists (select 1 from public.exercises e where e.id = exercise_id and public.can_manage_course(e.course_id)))
       or (challenge_id is not null and exists (select 1 from public.challenges c where c.id = challenge_id and c.created_by = auth.uid()))
    )));
create policy "submissions: je soumets" on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'submitted' and score is null and feedback is null);
create policy "submissions: modification" on public.submissions for update to authenticated
  using (
    (user_id = auth.uid() and status = 'submitted')
    or public.is_admin()
    or (public.is_trainer() and (
          (exercise_id  is not null and exists (select 1 from public.exercises e where e.id = exercise_id and public.can_manage_course(e.course_id)))
       or (challenge_id is not null and exists (select 1 from public.challenges c where c.id = challenge_id and c.created_by = auth.uid()))
    )));
-- (le trigger protect_submission_review empêche un étudiant de modifier note/commentaire)

-- ---------- challenges ----------
create policy "challenges: lecture publique" on public.challenges for select to anon, authenticated
  using (status in ('published','closed'));
create policy "challenges: lecture auteur" on public.challenges for select to authenticated
  using (public.is_admin() or (public.is_trainer() and created_by = auth.uid()));
create policy "challenges: création" on public.challenges for insert to authenticated
  with check (public.is_admin() or (public.is_trainer() and created_by = auth.uid()));
create policy "challenges: modification" on public.challenges for update to authenticated
  using (public.is_admin() or (public.is_trainer() and created_by = auth.uid()))
  with check (public.is_admin() or (public.is_trainer() and created_by = auth.uid()));
create policy "challenges: suppression admin" on public.challenges for delete to authenticated
  using (public.is_admin());

-- ---------- challenge_results ----------
create policy "results: lecture" on public.challenge_results for select to authenticated
  using (user_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.challenges c where c.id = challenge_id and c.created_by = auth.uid()));
create policy "results: écriture formateur" on public.challenge_results for all to authenticated
  using (public.is_admin() or exists (select 1 from public.challenges c where c.id = challenge_id and c.created_by = auth.uid() and public.is_trainer()))
  with check (public.is_admin() or exists (select 1 from public.challenges c where c.id = challenge_id and c.created_by = auth.uid() and public.is_trainer()));

-- ---------- tools ----------
create policy "tools: lecture publiée" on public.tools for select to anon, authenticated using (published);
create policy "tools: lecture admin"   on public.tools for select to authenticated using (public.is_admin());
create policy "tools: admin écrit"     on public.tools for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Correction des quiz côté serveur ----------
-- Les réponses ne quittent jamais la base : l'étudiant envoie ses choix, la fonction
-- calcule la note, enregistre une soumission et renvoie le score.
create or replace function public.grade_quiz(p_exercise_id uuid, p_choices jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  expected jsonb; total int; good int := 0; k text; pct numeric(5,2); sub_id uuid;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;

  if not exists (select 1 from public.exercises e join public.courses c on c.id = e.course_id
                 where e.id = p_exercise_id and e.kind = 'quiz' and e.published and c.status = 'published') then
    raise exception 'Quiz introuvable';
  end if;

  select answers into expected from public.exercise_answers where exercise_id = p_exercise_id;
  if expected is null then raise exception 'Quiz non configuré'; end if;

  select count(*) into total from jsonb_object_keys(expected);
  for k in select jsonb_object_keys(expected) loop
    if (p_choices ->> k) is not null and (p_choices ->> k)::int = (expected ->> k)::int then
      good := good + 1;
    end if;
  end loop;
  pct := round(100.0 * good / nullif(total, 0), 2);

  insert into public.submissions (user_id, exercise_id, content, status, score, reviewed_at)
  values (auth.uid(), p_exercise_id, p_choices::text, 'reviewed', pct, now())
  returning id into sub_id;

  return jsonb_build_object('submission_id', sub_id, 'correct', good, 'total', total, 'score', pct);
end $$;
revoke all on function public.grade_quiz(uuid, jsonb) from public, anon;
grant execute on function public.grade_quiz(uuid, jsonb) to authenticated;

-- ---------- Stockage (Supabase Storage) ----------
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('course-assets', 'course-assets', true),
  ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- Avatars : lecture publique, écriture dans son propre dossier (<uid>/fichier)
create policy "avatars: lecture" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: écriture perso" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: mise à jour perso" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Ressources de cours : lecture publique, écriture par formateurs/admin
create policy "course-assets: lecture" on storage.objects for select using (bucket_id = 'course-assets');
create policy "course-assets: écriture formateur" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-assets' and public.is_trainer());

-- Fichiers de soumission : privés (dossier = uid), lisibles par le propriétaire et les formateurs
create policy "submissions: dépôt perso" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions: lecture" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_trainer()));
