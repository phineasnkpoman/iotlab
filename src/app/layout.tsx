import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

// La barre de navigation dépend de la session : rendu dynamique sur toutes les pages.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "IoT LAB ESATIC", template: "%s · IoT LAB ESATIC" },
  description: "Plateforme d'apprentissage pratique de l'IoT, de l'électronique et des systèmes embarqués pour les étudiants de l'ESATIC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-signal focus:px-3 focus:py-2">
          Aller au contenu
        </a>
        <Navbar />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
