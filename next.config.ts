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
};

export default nextConfig;
