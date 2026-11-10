import { Fragment, type ReactNode } from "react";

/**
 * Rendu Markdown volontairement minimal (titres, listes, code, tableaux, citations,
 * gras, italique, code en ligne). Aucun HTML brut n'est interprété : le texte passe
 * par React, donc pas de risque XSS avec le contenu saisi par les formateurs.
 */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={i++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) parts.push(<code key={i++}>{tok.slice(1, -1)}</code>);
    else parts.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(
        <pre key={k++} data-lang={lang}><code>{code.join("\n")}</code></pre>,
      );
      continue;
    }
    if (line.startsWith("### ")) { out.push(<h3 key={k++}>{inline(line.slice(4))}</h3>); i++; continue; }
    if (line.startsWith("## ")) { out.push(<h2 key={k++}>{inline(line.slice(3))}</h2>); i++; continue; }
    if (line.startsWith("> ")) { out.push(<blockquote key={k++}>{inline(line.slice(2))}</blockquote>); i++; continue; }

    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*] /, ""));
      out.push(<ul key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ""));
      out.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>);
      continue;
    }
    if (line.includes("|") && lines[i + 1]?.match(/^\s*\|?\s*-{2,}/)) {
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) rows.push(cells(lines[i++]));
      out.push(
        <div key={k++} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr>{head.map((h, j) => <th key={j} className="border-b border-line px-3 py-2 text-left font-semibold">{inline(h)}</th>)}</tr></thead>
            <tbody>{rows.map((r, a) => <tr key={a}>{r.map((c, b) => <td key={b} className="border-b border-line/60 px-3 py-2 text-[#cdd5da]">{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.trim() === "") { i++; continue; }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{2,3} |> |```|\s*[-*] |\d+\. )/.test(lines[i])) para.push(lines[i++]);
    out.push(<p key={k++}>{inline(para.join(" "))}</p>);
  }
  return <Fragment>{out}</Fragment>;
}
