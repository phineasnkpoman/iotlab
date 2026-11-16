import type { NextConfig } from "next";

// Décision technique : on n'active pas `cacheComponents` (mode expérimental de
// Next 16). Les pages lisent la session Supabase (cookies) à chaque requête,
// le rendu dynamique classique est plus simple à comprendre et à déboguer.
const nextConfig: NextConfig = {
  // Traitement de Tailwind CSS v4 par Turbopack (configuration fournie par create-next-app).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  // Anciennes adresses : tout ce qui sert à pratiquer est maintenant regroupé dans /laboratoire.
  // Les liens déjà partagés continuent de fonctionner (les paramètres comme ?carte= sont conservés).
  async redirects() {
    return [
      { source: "/cablages", destination: "/laboratoire", permanent: true },
      { source: "/cablages/:slug", destination: "/laboratoire/montages/:slug", permanent: true },
      { source: "/cartes", destination: "/laboratoire/cartes", permanent: true },
      { source: "/cartes/:slug", destination: "/laboratoire/cartes/:slug", permanent: true },
      { source: "/outils", destination: "/laboratoire/outils", permanent: true },
      { source: "/laboratoire/capteurs", destination: "/laboratoire/simulateurs", permanent: true },
      { source: "/laboratoire/montages", destination: "/laboratoire", permanent: false },
    ];
  },
};

export default nextConfig;
