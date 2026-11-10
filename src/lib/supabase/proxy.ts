import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

const PRIVATE_PREFIXES = ["/dashboard", "/profil", "/formateur", "/admin"];

/** Rafraîchit la session et protège les routes privées. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isPrivate = PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  if (!isSupabaseConfigured) {
    if (isPrivate) return NextResponse.redirect(new URL("/connexion?erreur=config", request.url));
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // En-têtes (Cache-Control) fournis par @supabase/ssr : empêchent la mise en cache des réponses d'authentification.
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // getUser() valide le jeton auprès de Supabase (ne pas utiliser getSession() ici).
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isPrivate) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("redirection", path);
    const redirect = NextResponse.redirect(url);
    // Conserve les cookies éventuellement rafraîchis (ex. suppression d'une session expirée).
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}
