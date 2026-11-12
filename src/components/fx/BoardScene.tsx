"use client";

import { Board3D } from "./board3d/Board3D";

/** Carte 3D du haut de l'accueil : l'ordinateur monocarte, en grand format interactif. */
export function BoardScene() {
  return <Board3D slug="raspberry-pi" variant="hero" />;
}
