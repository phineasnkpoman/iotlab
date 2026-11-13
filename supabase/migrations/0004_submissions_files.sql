-- =====================================================================
-- IoT LAB ESATIC — Migration 0004 : dépôt de fichiers et relecture des soumissions
-- À exécuter une fois dans Supabase > SQL Editor. Le script peut être relancé sans risque.
--
-- Contexte : l'espace administrateur n'affichait aucune soumission. La cause était dans le
-- code (jointure ambiguë vers « profiles », corrigée dans l'application), pas dans la base.
-- Cette migration complète la base pour le dépôt de fichiers :
--   1. bucket privé « submissions » limité à 10 Mo par fichier ;
--   2. règles d'accès au stockage recréées (chacun dépose dans son dossier, les formateurs lisent) ;
--   3. un apprenant peut retirer un fichier qu'il n'a pas encore rattaché à une soumission ;
--   4. une soumission ne peut référencer qu'un fichier du dossier de son auteur ;
--   5. un index pour la liste des soumissions à corriger.
-- =====================================================================

-- 1) Bucket privé (créé s'il manque, sinon remis en privé avec la limite de taille).
insert into storage.buckets (id, name, public, file_size_limit)
values ('submissions', 'submissions', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- 2) Règles d'accès : le premier dossier du chemin est l'identifiant de l'auteur (<uid>/<fichier>).
drop policy if exists "submissions: dépôt perso" on storage.objects;
create policy "submissions: dépôt perso" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "submissions: lecture" on storage.objects;
create policy "submissions: lecture" on storage.objects for select to authenticated
  using (bucket_id = 'submissions'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_trainer()));

-- 3) Nettoyage : un fichier envoyé puis abandonné (soumission refusée) peut être supprimé
--    par son auteur, tant qu'aucune soumission ne le référence.
drop policy if exists "submissions: suppression perso" on storage.objects;
create policy "submissions: suppression perso" on storage.objects for delete to authenticated
  using (bucket_id = 'submissions'
         and (storage.foldername(name))[1] = auth.uid()::text
         and not exists (select 1 from public.submissions s where s.file_path = storage.objects.name));

-- 4) Garde-fou en base : le fichier joint appartient forcément à l'auteur de la soumission.
--    « not valid » : la règle s'applique aux nouvelles lignes sans bloquer sur l'existant.
alter table public.submissions drop constraint if exists submissions_file_owner;
alter table public.submissions add constraint submissions_file_owner
  check (file_path is null or split_part(file_path, '/', 1) = user_id::text) not valid;

-- 5) Liste des soumissions par statut, des plus récentes aux plus anciennes.
create index if not exists submissions_status_created_idx on public.submissions (status, created_at desc);
