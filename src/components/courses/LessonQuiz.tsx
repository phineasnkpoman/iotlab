"use client";

import { useActionState, useEffect, useMemo, useRef, useState, startTransition, type KeyboardEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, CircleCheck, Lightbulb, ListChecks, RotateCcw, X } from "lucide-react";
import { submitQuiz, type QuizResult, type QuizState } from "@/app/actions/learning";
import type { QuizQuestion } from "@/types/db";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/* ---------- Mélange des réponses ----------
   Ordre pseudo-aléatoire mais déterministe (même résultat côté serveur et navigateur),
   qui change à chaque nouvelle tentative. La valeur envoyée reste l'index d'origine. */
function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function shuffledOrder(seed: string, n: number) {
  let a = seedFrom(seed);
  const rand = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}

/** Met en police à chasse fixe les appels de fonction (pinMode(8, OUTPUT);) et les constantes Arduino. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\b[A-Za-z_][\w.]*\([^()]*\);?|\b(?:HIGH|LOW|INPUT_PULLUP|INPUT|OUTPUT)\b)/g);
  return <>{parts.map((p, i) => (i % 2 === 1
    ? <code key={i} className="rounded-md border border-tint/10 bg-tint/[0.06] px-1.5 py-px font-mono text-[0.86em]">{p}</code>
    : p))}</>;
}

function CodeSnippet({ source }: { source: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-[16px] border border-white/[0.08] bg-[#070b14] py-3 font-mono text-[13px] leading-[1.7] text-[#e6edf7]"><code>
      {source.split("\n").map((l, i) => (
        <span key={i} className="flex">
          <span className="tabular w-9 shrink-0 select-none pr-3 text-right text-[#4b5870]" aria-hidden="true">{i + 1}</span>
          <span className="whitespace-pre pr-5">{l}</span>
        </span>
      ))}
    </code></pre>
  );
}

interface QuizProps {
  exerciseId: string; courseSlug: string; title: string; intro?: string | null;
  questions: QuizQuestion[]; passScore: number; required: boolean; bestScore: number | null;
}

/** QCM de fin de leçon : une question à la fois, puis un bilan avec indices ou corrigé expliqué. */
export function LessonQuiz(props: QuizProps) {
  const { questions, passScore, required, bestScore } = props;
  const validated = bestScore !== null && bestScore >= passScore;
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(!validated);

  return (
    <section id={`qcm-${props.exerciseId}`} aria-labelledby={`qcm-${props.exerciseId}-titre`} className="glass mt-10 scroll-mt-28 overflow-hidden rounded-[28px]">
      <header className="flex flex-wrap items-start gap-4 border-b border-tint/[0.07] px-5 py-5 sm:px-7">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/[0.1] text-primary-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]">
          <ListChecks size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-48 flex-1">
          <h2 id={`qcm-${props.exerciseId}-titre`} className="text-lg font-semibold tracking-[-0.01em]">{props.title}</h2>
          <p className="tabular mt-1 text-sm text-muted">
            {questions.length} question{questions.length > 1 ? "s" : ""} · {passScore} % pour valider{required && " · obligatoire pour terminer la leçon"}
          </p>
        </div>
        {bestScore !== null && (
          <span className={`tabular inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${validated ? "border-ok/35 bg-ok/10 text-ok-soft" : "border-copper/35 bg-copper/10 text-copper"}`}>
            {validated && <Check size={13} aria-hidden="true" />}
            {validated ? "Validé" : "Pas encore validé"} · meilleur score {Math.round(bestScore)} %
          </span>
        )}
      </header>

      {open ? (
        <QuizRun key={attempt} {...props} attempt={attempt} onRestart={() => setAttempt((a) => a + 1)} />
      ) : (
        <div className="flex flex-wrap items-center gap-4 px-5 py-5 sm:px-7">
          <p className="flex flex-1 items-center gap-2.5 text-sm text-muted">
            <CircleCheck size={18} className="shrink-0 text-ok" aria-hidden="true" />
            Vous avez déjà réussi ce QCM. Vous pouvez le refaire pour réviser.
          </p>
          <Button variant="secondary" onClick={() => setOpen(true)}><RotateCcw size={15} aria-hidden="true" /> Refaire le QCM</Button>
        </div>
      )}
    </section>
  );
}

function QuizRun({ exerciseId, courseSlug, intro, questions, passScore, required, attempt, onRestart }: QuizProps & { attempt: number; onRestart: () => void }) {
  const [state, dispatch, pending] = useActionState(submitQuiz.bind(null, exerciseId, courseSlug), {} as QuizState);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const orders = useMemo(
    () => questions.map((q) => shuffledOrder(`${exerciseId}:${q.id}:${attempt}`, q.options.length)),
    [questions, exerciseId, attempt],
  );

  const total = questions.length;
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const q = questions[step];
  const isLast = step === total - 1;
  const current = q ? answers[q.id] : undefined;

  const go = (to: number) => { if (to < 0 || to >= total) return; setDir(to > step ? 1 : -1); setStep(to); };
  const submit = () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(answers)) fd.set(k, String(v));
    startTransition(() => dispatch(fd));
  };
  const next = () => {
    if (current === undefined) return;
    if (!isLast) go(step + 1);
    else if (answered === total) submit();
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !q) return;
    const n = Number(e.key);
    if (n >= 1 && n <= q.options.length) { setAnswers((a) => ({ ...a, [q.id]: orders[step][n - 1] })); e.preventDefault(); return; }
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") { next(); e.preventDefault(); }
  };

  if (state.result) {
    return <QuizResults result={state.result} questions={questions} answers={answers} passScore={passScore} required={required} onRestart={onRestart} />;
  }

  const firstMissing = questions.findIndex((x) => answers[x.id] === undefined);
  return (
    <div className="px-5 pb-6 pt-5 sm:px-7" onKeyDown={onKey}>
      {intro && step === 0 && answered === 0 && <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>}

      <div className="flex items-center gap-4">
        <p aria-live="polite" className="tabular shrink-0 font-mono text-xs text-muted">Question {step + 1} / {total}</p>
        <div className="flex flex-1 gap-1.5">
          {questions.map((x, i) => {
            const done = answers[x.id] !== undefined;
            return (
              <button key={x.id} type="button" onClick={() => go(i)} aria-label={`Aller à la question ${i + 1}${done ? " (répondue)" : ""}`}
                      aria-current={i === step ? "step" : undefined}
                      className="group/seg relative h-6 flex-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <span className={`absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-[background-color,box-shadow] duration-300 ${done ? "bg-primary" : "bg-tint/[0.1] group-hover/seg:bg-tint/20"} ${i === step ? "shadow-[0_0_0_3px_rgb(var(--primary-rgb)/0.22)]" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>

      {q && (
        <fieldset key={`${step}-${attempt}`} className="quiz-step mt-6" style={{ ["--dx" as string]: `${dir * 18}px` }}>
          <legend className="text-[17px] font-medium leading-snug tracking-[-0.01em]"><Rich text={q.question} /></legend>
          {q.code && <CodeSnippet source={q.code} />}
          <div className="mt-5 grid gap-2.5">
            {orders[step].map((orig, pos) => (
              <label key={orig}
                     className="group/opt flex min-h-14 cursor-pointer items-center gap-3.5 rounded-[18px] border border-tint/10 bg-well px-4 py-3 text-[15px] leading-snug transition-[border-color,background-color,box-shadow,transform] duration-200 hover:border-line-strong hover:bg-tint/[0.05] active:scale-[0.995] has-[:checked]:border-primary/60 has-[:checked]:bg-primary/[0.1] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/45">
                <input type="radio" name={`${exerciseId}-${q.id}`} value={orig} checked={current === orig}
                       onChange={() => setAnswers((a) => ({ ...a, [q.id]: orig }))} className="sr-only" />
                <span aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-tint/15 bg-tint/[0.04] font-mono text-xs text-muted transition-colors duration-200 group-has-[:checked]/opt:border-primary group-has-[:checked]/opt:bg-primary group-has-[:checked]/opt:text-white">
                  {LETTERS[pos]}
                </span>
                <span><Rich text={q.options[orig]} /></span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 space-y-3">
        <FormMessage error={state.error} />
        {isLast && answered < total && firstMissing >= 0 && (
          <p className="text-sm text-muted">
            {total - answered} question{total - answered > 1 ? "s" : ""} sans réponse.{" "}
            <button type="button" onClick={() => go(firstMissing)} className="text-primary-soft underline-offset-4 hover:underline">Aller à la question {firstMissing + 1}</button>
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" className="!px-3 sm:!px-5" onClick={() => go(step - 1)} disabled={step === 0}><ArrowLeft size={16} aria-hidden="true" /> Précédente</Button>
          <p className="hidden flex-1 text-right text-xs text-muted md:[@media(pointer:fine)]:block">Touches 1 à {q?.options.length ?? 4} pour répondre, Entrée pour continuer</p>
          {isLast
            ? <Button type="button" onClick={submit} disabled={pending || answered < total}>{pending ? "Correction…" : <>Valider mes réponses <Check size={16} aria-hidden="true" /></>}</Button>
            : <Button type="button" onClick={next} disabled={current === undefined}>Suivante <ArrowRight size={16} aria-hidden="true" /></Button>}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, passScore, passed }: { score: number; passScore: number; passed: boolean }) {
  const r = 52, c = 2 * Math.PI * r;
  const tick = (passScore / 100) * 2 * Math.PI - Math.PI / 2;
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32 shrink-0" role="img" aria-label={`Score : ${Math.round(score)} %, seuil de réussite ${passScore} %`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-tint/[0.08]" />
      <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 64 64)"
              stroke={passed ? "var(--ok)" : "var(--copper)"} strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(score, 0.5) / 100)}
              className="ring-fill" style={{ ["--ring-c" as string]: `${c}` }} />
      <line x1={64 + 43 * Math.cos(tick)} y1={64 + 43 * Math.sin(tick)} x2={64 + 61 * Math.cos(tick)} y2={64 + 61 * Math.sin(tick)}
            stroke="var(--text)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <text x="64" y="70" textAnchor="middle" className="tabular fill-[var(--text)] text-[26px] font-semibold tracking-[-0.03em]">{Math.round(score)}<tspan className="fill-[var(--muted)] text-[14px] font-medium"> %</tspan></text>
    </svg>
  );
}

function QuizResults({ result, questions, answers, passScore, required, onRestart }: {
  result: QuizResult; questions: QuizQuestion[]; answers: Record<string, number>;
  passScore: number; required: boolean; onRestart: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: false }); }, []);
  const needed = Math.ceil((passScore * result.total) / 100);
  const wrong = result.wrong ? new Set(result.wrong) : null;

  return (
    <div className="px-5 pb-6 pt-6 sm:px-7">
      <div className="flex flex-wrap items-center gap-6">
        <ScoreRing score={result.score} passScore={result.passScore} passed={result.passed} />
        <div className="min-w-56 flex-1">
          <h3 ref={headingRef} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] outline-none">
            {result.passed ? "QCM réussi" : "Pas encore validé"}
          </h3>
          <p className="tabular mt-1 text-sm text-muted">
            {result.correct} bonne{result.correct > 1 ? "s" : ""} réponse{result.correct > 1 ? "s" : ""} sur {result.total}
            {!result.passed && ` : il en faut ${needed} pour valider.`}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed">
            {result.passed
              ? (required ? "La leçon est déverrouillée : vous pouvez la marquer comme terminée. Le corrigé expliqué est ci-dessous." : "Le corrigé expliqué est ci-dessous.")
              : "Lisez les indices des questions ratées, relisez le passage de la leçon, puis réessayez : les réponses seront mélangées."}
          </p>
        </div>
      </div>

      <ol className="mt-7 space-y-2.5">
        {questions.map((q, i) => {
          const ok = wrong ? !wrong.has(q.id) : null;
          const fix = result.correction?.[q.id];
          const mine = answers[q.id];
          return (
            <li key={q.id} className="rounded-[18px] border border-tint/[0.08] bg-well px-4 py-3.5">
              <div className="flex gap-3">
                {ok === null ? <span className="tabular mt-0.5 w-6 shrink-0 text-center font-mono text-xs text-muted">{i + 1}</span>
                  : <span aria-label={ok ? "Bonne réponse" : "Réponse fausse"} style={{ ["--d" as string]: `${200 + i * 70}ms` }}
                          className={`pop-in mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${ok ? "bg-ok/15 text-ok" : "bg-copper/15 text-copper"}`}>
                      {ok ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : <X size={14} strokeWidth={2.5} aria-hidden="true" />}
                    </span>}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium leading-snug"><Rich text={q.question} /></p>
                  {fix ? (
                    <div className="mt-2 space-y-1.5 leading-relaxed">
                      {ok === false && mine !== undefined && <p className="text-muted">Votre réponse : <span className="line-through decoration-copper/60"><Rich text={q.options[mine] ?? ""} /></span></p>}
                      <p><span className="text-ok-soft">Bonne réponse : </span><Rich text={q.options[fix.answer] ?? ""} /></p>
                      {fix.explanation && <p className="text-muted"><Rich text={fix.explanation} /></p>}
                    </div>
                  ) : ok === false && q.hint ? (
                    <p className="mt-2 flex gap-2 leading-relaxed text-muted"><Lightbulb size={15} className="mt-0.5 shrink-0 text-copper" aria-hidden="true" /><span><span className="text-text">Indice : </span><Rich text={q.hint} /></span></p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" variant={result.passed ? "secondary" : "primary"} onClick={onRestart}>
          <RotateCcw size={15} aria-hidden="true" /> {result.passed ? "Refaire le QCM" : "Réessayer"}
        </Button>
        {result.passed && required && (
          <a href="#fin-de-lecon" className="inline-flex items-center gap-1.5 text-sm text-primary-soft underline-offset-4 hover:underline">
            Terminer la leçon <ArrowDown size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

