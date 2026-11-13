# IoT LAB ESATIC

Plateforme d'apprentissage de l'IoT, de l'électronique et des systèmes embarqués pour tous les étudiants de l'ESATIC.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth, PostgreSQL, Storage, RLS) · Vercel.

## 1. Ce qui fonctionne (et ce qui reste à faire)

Fonctionnel dès que Supabase est configuré :
- Pages publiques : accueil, catalogue (recherche, filtres niveau/catégorie, tri), détail d'une formation, leçons, outils, laboratoire, challenges, à propos.
- Authentification : inscription, confirmation par email, connexion, déconnexion, mot de passe oublié et réinitialisation, protection des routes, redirection selon le rôle.
- Formation « Premiers pas avec Arduino » : 5 modules, 10 leçons rédigées, 3 exercices pratiques liés à Wokwi, quiz de 5 questions corrigé côté base de données.
- Progression : inscription à une formation, « Marquer comme terminée », tableau de bord calculé depuis Supabase.
- Soumissions d'exercices et de challenges (lien + texte), correction par le formateur (note + commentaire).
- Profil étudiant (nom, filière, promotion, présentation). Le rôle n'est jamais modifiable par l'étudiant.
- Espace formateur : publier ses formations, corriger les soumissions.
- Espace administrateur : rôles des utilisateurs, publication des formations, challenges, outils, correction.

Pas encore réalisé (à développer ensuite) :
- Création et édition des formations, leçons, exercices et challenges **depuis l'interface**. Pour l'instant, on les gère dans Supabase (Table Editor) ou en SQL. Les contenus ne sont donc pas dans le code, mais l'éditeur visuel manque.
- Upload de photo de profil et de fichiers de soumission : les buckets et leurs politiques de sécurité existent (`avatars`, `course-assets`, `submissions`), mais aucune interface n'envoie encore de fichier.
- Pas de simulateur intégré : Wokwi s'ouvre dans un nouvel onglet (lien officiel), car l'intégration en iframe n'est pas garantie.

## 2. Installation locale (Windows + VS Code)

1. Installez **Node.js 22 LTS** (nodejs.org) et **VS Code**.
2. Ouvrez le dossier du projet dans VS Code, puis un terminal (Ctrl + `) :
   ```
   npm install
   copy .env.example .env.local
   npm run dev
   ```
3. Ouvrez http://localhost:3000. Sans Supabase, les pages publiques s'affichent avec des états vides explicites.

## 3. Configurer Supabase

1. Créez un compte sur supabase.com, puis un projet (région proche, par exemple Paris).
2. **Project Settings > API** : copiez l'URL du projet et la clé `anon` (publique) dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   **Ne copiez jamais la clé `service_role` dans le projet.** Elle n'est pas nécessaire.
3. **SQL Editor** : exécutez dans l'ordre le contenu de
   - `supabase/migrations/0001_schema.sql` (tables),
   - `supabase/migrations/0002_rls.sql` (sécurité, stockage, correction des quiz),
   - `supabase/migrations/0003_profile_repair.sql` (crée les profils manquants, autorise l'auto-création du profil `student`),
   - `supabase/migrations/0004_submissions_files.sql` (dépôt de fichiers des soumissions : bucket privé de 10 Mo, règles d'accès, contrôle du propriétaire),
   - `supabase/seed.sql` (catégories, outils, challenges, formation pilote).
4. **Authentication > URL Configuration** : *Site URL* = `http://localhost:3000` ; dans *Redirect URLs*, ajoutez `http://localhost:3000/auth/callback` (et plus tard l'adresse Vercel avec `/auth/callback`).
5. **Authentication > Providers > Email** : laissez « Confirm email » activé.
6. Redémarrez `npm run dev`.

### Créer le premier administrateur
Inscrivez-vous sur le site, confirmez l'email, puis dans le SQL Editor :
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'votre@email.ci');
```
Ensuite, l'administrateur attribue les rôles depuis `/admin`. Pour qu'un formateur ait une formation, mettez son identifiant dans `courses.instructor_id`.

## 3 bis. Dépannage : retour sur /connexion après connexion

Symptôme : `/connexion?redirection=%2Fdashboard` réapparaît alors que l'identifiant est correct.
Cause : la session est valide, mais la ligne de l'utilisateur dans `public.profiles` est absente ou illisible. Exécutez `0003_profile_repair.sql`. Si le problème persiste, la page affiche « Profil introuvable » et le terminal de `npm run dev` détaille l'erreur Supabase (préfixe `[iotlab]`).

## 3 ter. Soumissions : l'administrateur ne voyait rien

Symptôme : les apprenants envoyaient leurs travaux, mais `/admin` et `/formateur` affichaient « Aucune soumission ».
Cause : la table `submissions` a deux clés étrangères vers `profiles` (`user_id` pour l'auteur, `reviewed_by` pour le correcteur). La requête `profiles(full_name)` était donc ambiguë : Supabase répondait par l'erreur `PGRST201` et la page affichait une liste vide sans rien signaler.
Correction : `src/services/submissions.ts` nomme la relation (`author:profiles!submissions_user_id_fkey(full_name)`) et la page affiche désormais l'erreur Supabase si la lecture échoue.

Fonctionnement actuel :
- l'apprenant joint un fichier (code, `diagram.json`, photo, PDF, .zip ; 10 Mo au plus), un lien Wokwi et/ou un texte ;
- le fichier part du navigateur vers le bucket privé `submissions`, dans le dossier `<identifiant de l'apprenant>/` ; l'action serveur vérifie qu'il existe avant d'enregistrer la soumission ;
- l'administrateur (ou le formateur responsable) voit les soumissions « À corriger », télécharge le fichier par un lien temporaire, met une note et un commentaire ;
- l'apprenant retrouve la note et le commentaire sous le formulaire et dans son tableau de bord.

Pour activer le dépôt de fichiers, exécutez une fois `0004_submissions_files.sql` dans le SQL Editor (le script peut être relancé sans risque).

## 4. Base de données

12 tables : `profiles`, `categories`, `courses`, `lessons`, `enrollments`, `lesson_progress`, `exercises`, `exercise_answers`, `submissions`, `tools`, `challenges`, `challenge_results`. Clés primaires UUID, clés étrangères avec suppression en cascade, `created_at` / `updated_at` automatiques.

Choix de conception :
- Les bonnes réponses du quiz sont dans `exercise_answers`, illisible pour les étudiants. La fonction `grade_quiz` calcule la note dans la base.
- `submissions` sert aux exercices **et** aux challenges (une contrainte impose l'un ou l'autre).
- Le contenu des leçons est du Markdown simplifié, rendu sans HTML brut (pas de risque XSS).

## 5. Sécurité

- RLS activée sur les 12 tables ; politiques par rôle dans `0002_rls.sql`.
- Le rôle est toujours lu dans la base (jamais dans le navigateur). Un trigger empêche tout changement de rôle hors administrateur, et le trigger d'inscription force `student`.
- Un étudiant ne peut pas s'auto-noter : un trigger bloque la modification de la note et du commentaire.
- Les actions sensibles (rôles, publication, correction) sont des Server Actions qui revérifient le rôle côté serveur, en plus de la RLS.
- Fichier `src/proxy.ts` : rafraîchit la session et bloque `/dashboard`, `/profil`, `/formateur`, `/admin` sans connexion.

## 6. Déploiement sur Vercel

1. Poussez le projet sur GitHub (compte gratuit, dépôt privé ou public). Le fichier `.env.local` est ignoré par Git : ne le publiez pas.
2. Sur vercel.com, **Add New > Project**, importez le dépôt.
3. Ajoutez les 3 variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` = l'adresse Vercel).
4. Déployez, puis ajoutez l'adresse Vercel et `/auth/callback` dans les URLs autorisées de Supabase (étape 4 ci-dessus).

## 7. Structure

```
src/app/            pages et Server Actions (actions/)
src/components/     ui, layout, courses, forms, dashboard
src/lib/supabase/   clients navigateur, serveur et session (proxy)
src/services/       accès aux données (auth, catalogue, progression)
src/types/ utils/   types TypeScript, formatage, rendu Markdown
supabase/           migrations SQL et seed.sql
```

## 8. Décisions techniques
- Pas de `cacheComponents` (mode expérimental de Next 16) : le rendu dynamique est plus simple avec des sessions par cookie.
- Next 16 : le fichier `middleware` s'appelle `proxy.ts`.
- Polices Geist via le paquet `geist` (hébergées localement, pas d'appel à Google Fonts).
- Peu de dépendances : `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lucide-react`, `geist`.
