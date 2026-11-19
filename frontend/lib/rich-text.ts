const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "h4",
  "blockquote",
]);

function safeHref(attrs: string): string | null {
  const match = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
  const href = (match?.[1] ?? match?.[2] ?? "").trim();
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href.replace(/"/g, "");
  return null;
}

/** Keep a small set of formatting tags from a SportsHub rich-text description. */
export function richTextHtml(value: string): string {
  const stripped = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  return stripped.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;
    if (tag === "br") return "<br>";
    if (tag === "a") {
      const href = safeHref(rawAttrs);
      return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    return `<${tag}>`;
  });
}

export function isRichText(value: string): boolean {
  return /<\/?[a-z][a-z0-9]*\b[^>]*>/i.test(value);
}
