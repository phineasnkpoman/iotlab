"use client";

import { useActionState, useId, useRef, useState, useTransition } from "react";
import { FileUp, Paperclip, X } from "lucide-react";
import type { FormState } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";

/*
 * Formulaire de soumission commun aux exercices et aux challenges.
 * Le fichier part directement du navigateur vers le bucket privé « submissions » (dossier de
 * l'apprenant, protégé par les règles Supabase), puis l'action serveur enregistre la soumission
 * avec le chemin du fichier. On évite ainsi la limite de taille des actions serveur.
 */

export const MAX_FILE_MB = 10;
const ACCEPT = [".ino", ".cpp", ".c", ".h", ".hpp", ".py", ".json", ".txt", ".md", ".csv", ".zip", ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".fzz"];

const formatSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} Ko` : `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`);

/** Nom de fichier sûr pour le stockage : sans accents, sans espaces, 80 caractères au plus. */
function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const base = (dot > 0 ? name.slice(0, dot) : name).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "fichier";
  return `${base}${ext.replace(/[^a-z0-9.]/g, "")}`;
}

function uploadError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("bucket not found")) return "Le dépôt de fichiers n'est pas encore activé sur le serveur. Prévenez un administrateur (migration 0004).";
  if (m.includes("exceeded") || m.includes("too large") || m.includes("size")) return `Fichier trop lourd : ${MAX_FILE_MB} Mo au maximum.`;
  if (m.includes("row-level security") || m.includes("unauthorized") || m.includes("jwt")) return "Envoi refusé : reconnectez-vous puis réessayez.";
  return "L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.";
}

export function SubmissionForm({ action, idPrefix, linkLabel, submitLabel }: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  idPrefix: string;
  linkLabel: string;
  submitLabel: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  // Soumission acceptée : on vide le formulaire pour un éventuel nouvel envoi.
  const [state, formAction, saving] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await action(prev, fd);
    if (res.message) { form.current?.reset(); setFile(null); }
    return res;
  }, {} as FormState);
  const [, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const busy = uploading || saving;

  const pick = (f: File | null | undefined) => {
    setLocalError(null);
    if (!f) return;
    const ext = f.name.includes(".") ? f.name.slice(f.name.lastIndexOf(".")).toLowerCase() : "";
    if (!ACCEPT.includes(ext)) { setLocalError(`Format non accepté. Formats possibles : ${ACCEPT.join(" ")}`); return; }
    if (f.size > MAX_FILE_MB * 1024 * 1024) { setLocalError(`Fichier trop lourd : ${MAX_FILE_MB} Mo au maximum.`); return; }
    setFile(f);
  };

  const clear = () => { setFile(null); if (input.current) input.current.value = ""; };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setLocalError(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("file");

    if (file) {
      setUploading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLocalError("Votre session a expiré : reconnectez-vous."); return; }
        const path = `${user.id}/${Date.now().toString(36)}-${safeName(file.name)}`;
        const { error } = await supabase.storage.from("submissions").upload(path, file, {
          contentType: file.type || "application/octet-stream", upsert: false,
        });
        if (error) { setLocalError(uploadError(error.message)); return; }
        fd.set("file_path", path);
      } catch {
        setLocalError("L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.");
        return;
      } finally {
        setUploading(false);
      }
    }
    startTransition(() => formAction(fd));
  };

  return (
    <form ref={form} onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <span id={`${idPrefix}-file-label`} className="text-sm font-medium">Fichier de votre réalisation</span>
        {file ? (
          <div className="flex items-center gap-3 rounded-[16px] border border-primary/35 bg-primary/[0.07] px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-soft"><Paperclip size={16} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{file.name}</span>
              <span className="tabular block text-xs text-muted">{formatSize(file.size)}</span>
            </span>
            <button type="button" onClick={clear} disabled={busy} aria-label={`Retirer ${file.name}`}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-tint/[0.08] hover:text-text disabled:opacity-50">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label htmlFor={`${idPrefix}-file`}
                 onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                 onDragLeave={() => setDragging(false)}
                 onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
                 className={`group flex cursor-pointer flex-col items-center gap-2 rounded-[18px] border border-dashed px-4 py-6 text-center transition-[border-color,background-color] duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/60 ${dragging
                   ? "border-primary bg-primary/[0.08]" : "border-tint/15 bg-well hover:border-tint/30"}`}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-tint/10 bg-tint/[0.05] text-muted transition-colors group-hover:text-text">
              <FileUp size={18} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="text-sm"><span className="font-medium text-text">Choisissez un fichier</span> <span className="text-muted">ou déposez-le ici</span></span>
            <span id={hintId} className="text-xs text-muted">Code (.ino, .py), diagram.json, photo, PDF ou .zip. {MAX_FILE_MB} Mo au maximum.</span>
            <input ref={input} id={`${idPrefix}-file`} name="file" type="file" accept={ACCEPT.join(",")} aria-describedby={hintId}
                   className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        )}
      </div>
      <Field id={`${idPrefix}-link`} name="link_url" type="url" inputMode="url" label={linkLabel} placeholder="https://wokwi.com/projects/…" />
      <TextArea id={`${idPrefix}-content`} name="content" rows={4} label="Explications ou code" maxLength={5000} />
      <FormMessage error={localError ?? state.error} message={localError ? undefined : state.message} />
      <Button type="submit" disabled={busy}>
        {uploading ? "Envoi du fichier…" : saving ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}
