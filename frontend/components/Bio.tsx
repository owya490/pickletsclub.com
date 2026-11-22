"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { isRichText, richTextHtml } from "@/lib/rich-text";

const RICH_TEXT =
  "[&_a]:font-medium [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_h2]:mb-1 [&_h2]:font-display [&_h2]:text-xl [&_h3]:mb-1 [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5";

export function Bio({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const rich = isRichText(text);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  const textClassName = `mt-3 text-[15px] leading-relaxed text-ink ${rich ? RICH_TEXT : "whitespace-pre-line"} ${expanded ? "" : "line-clamp-3 lg:line-clamp-5"}`;

  return (
    <section className={className}>
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">About us</h2>
      {rich ? (
        <div ref={ref} className={textClassName} dangerouslySetInnerHTML={{ __html: richTextHtml(text) }} />
      ) : (
        <div ref={ref} className={textClassName}>
          {text}
        </div>
      )}
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 text-[13px] font-medium text-forest underline-offset-2 hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}
