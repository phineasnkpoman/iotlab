import { CopyButton } from "@/components/ui/CopyButton";

/** Sépare le code de son commentaire de fin de ligne, en ignorant les guillemets. */
function splitComment(line: string, marker: string) {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (line.startsWith(marker, i)) return [line.slice(0, i), line.slice(i)] as const;
  }
  return [line, ""] as const;
}

/** Programme du montage, avec numéros de ligne, commentaires atténués et bouton de copie. */
export function CodeBlock({ source, file, lang }: { source: string; file: string; lang: "cpp" | "python" }) {
  const lines = source.replace(/\n$/, "").split("\n");
  const marker = lang === "python" ? "#" : "//";
  return (
    <figure className="overflow-hidden rounded-[22px] border border-tint/[0.09] bg-[#070b14] shadow-[0_24px_60px_-30px_rgb(0_0_0/0.6)]">
      <figcaption className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-[#9aa7ba]">{file}</span>
        <CopyButton text={source} label="Copier" className="!border-white/10 !bg-white/[0.06] !text-[#e6edf7] hover:!bg-white/[0.12]" />
      </figcaption>
      <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-[1.7] text-[#e6edf7]"><code>
        {lines.map((l, i) => {
          const [code, comment] = splitComment(l, marker);
          return (
            <span key={i} className="flex">
              <span className="tabular w-11 shrink-0 select-none pr-4 text-right text-[#4b5870]" aria-hidden="true">{i + 1}</span>
              <span className="whitespace-pre pr-6">{code}{comment && <span className="text-[#7f8ea6]">{comment}</span>}</span>
            </span>
          );
        })}
      </code></pre>
    </figure>
  );
}
