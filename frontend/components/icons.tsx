type IconProps = { className?: string };

export function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ className, direction }: IconProps & { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        d={direction === "left" ? "M14.5 6 8.5 12l6 6" : "m9.5 6 6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

/** Top-down court, used where an event has no image. */
export function CourtArt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden>
      <rect x="2" y="2" width="60" height="36" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M32 2v36" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 2v36M42 2v36" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
