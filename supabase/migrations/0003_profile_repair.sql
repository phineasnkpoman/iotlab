-- =====================================================================
-- IoT LAB ESATIC — Migration 0003 : réparation des profils manquants
-- Cause du bug « retour sur /connexion » : un utilisateur existait dans auth.users
-- sans ligne dans public.profiles (compte créé avant le trigger / les migrations).
-- =====================================================================

-- 1) Crée les profils manquants (toujours en rôle 'student').
insert into public.profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', ''), 'student'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- 2) Filet de sécurité : l'application peut créer le profil de l'utilisateur connecté,
--    uniquement pour lui-même et uniquement avec le rôle 'student'.
drop policy if exists "profiles: création de son profil" on public.profiles;
create policy "profiles: création de son profil" on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'student');

-- 3) Recrée le trigger d'inscription au cas où il aurait été perdu.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
