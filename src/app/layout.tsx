import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { THEME_SCRIPT } from "@/components/theme/theme";
import "./globals.css";

// La barre de navigation dépend de la session : rendu dynamique sur toutes les pages.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "IoT LAB ESATIC", template: "%s · IoT LAB ESATIC" },
  description: "Plateforme d'apprentissage pratique de l'IoT, de l'électronique et des systèmes embarqués pour les étudiants de l'ESATIC.",
};

// Couleur de la barre du navigateur sur mobile, accordée au thème du système.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf2f9" },
    { media: "(prefers-color-scheme: dark)", color: "#060a12" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme est corrigé avant le premier affichage par THEME_SCRIPT : React doit accepter cet écart.
    <html lang="fr" data-theme="dark" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen overflow-x-hidden">
        {/* Lumière ambiante fixe : c'est elle que les panneaux de verre floutent. */}
        <div className="ambient" aria-hidden="true"><span /><span /><span /></div>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
          Aller au contenu
        </a>
        <Navbar />
        <main id="contenu" className="overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
