"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function Bio({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <section className="mb-10">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">About us</h2>
      <p
        ref={ref}
        className={`mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink ${expanded ? "" : "line-clamp-3"}`}
      >
        {text}
      </p>
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
