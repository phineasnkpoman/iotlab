"use client";

import { submitChallenge } from "@/app/actions/learning";
import { SubmissionForm } from "./SubmissionForm";

export function ChallengeSubmitForm({ challengeId, slug }: { challengeId: string; slug: string }) {
  return (
    <SubmissionForm action={submitChallenge.bind(null, challengeId, slug)} idPrefix={`ch-${challengeId}`}
                    linkLabel="Lien de votre réalisation (Wokwi, dépôt…)" submitLabel="Envoyer ma participation" />
  );
}
