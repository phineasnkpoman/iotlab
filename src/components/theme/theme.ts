/*
 * Thème clair / sombre.
 * La préférence (« light », « dark » ou absente = système) est gardée dans localStorage
 * et appliquée par l'attribut data-theme de <html>. THEME_SCRIPT l'applique avant le premier
 * affichage (aucun flash) ; le reste de ce fichier sert au sélecteur, côté navigateur.
 */

export type ThemePref = "light" | "dark" | "system";

const KEY = "theme";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** Script exécuté dans <head>, avant que le navigateur ne peigne la page. */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${KEY}");var t=p==="light"||p==="dark"?p:(matchMedia("${LIGHT_QUERY}").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function apply(pref: ThemePref) {
  document.documentElement.setAttribute("data-theme", resolve(pref));
}

/** Change le thème, avec un fondu enchaîné si le navigateur le permet et si l'utilisateur accepte les animations. */
export function setPref(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {
    // Stockage indisponible (navigation privée stricte) : le choix vaut pour cette page seulement.
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (doc.startViewTransition && !calm) doc.startViewTransition(() => apply(pref));
  else apply(pref);
  window.dispatchEvent(new Event("themechange"));
}

/** Abonnement pour useSyncExternalStore : choix de l'utilisateur, autre onglet, ou thème du système. */
export function subscribe(onChange: () => void) {
  const mq = matchMedia(LIGHT_QUERY);
  const onSystem = () => { if (readPref() === "system") apply("system"); onChange(); };
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { apply(readPref()); onChange(); } };
  mq.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  window.addEventListener("themechange", onChange);
  return () => {
    mq.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("themechange", onChange);
  };
}
