import type { ClubEvent } from "@/lib/sportshub";
import { formatPrice, formatTimeRange } from "@/lib/format";
import { CourtArt } from "./icons";

type Status = { label: string; tone: "olive" | "pink" | "muted" };

export function eventStatus(event: ClubEvent): Status | null {
  const tickets = event.ticketTypes;
  if (tickets.length === 0) return { label: "Not bookable yet", tone: "muted" };
  if (event.paused) return { label: "Paused", tone: "muted" };
  if (!event.acceptsStripe && tickets.some((t) => t.priceCents > 0)) {
    return { label: "Payments inactive", tone: "muted" };
  }
  if (tickets.every((t) => t.soldOut)) {
    return event.waitlistEnabled ? { label: "Waitlist", tone: "pink" } : { label: "Sold out", tone: "muted" };
  }
  const open = tickets.filter((t) => !t.soldOut);
  if (open.every((t) => t.vacancy !== null)) {
    const spots = open.reduce((sum, t) => sum + (t.vacancy ?? 0), 0);
    if (spots <= 5) return { label: `${spots} spot${spots === 1 ? "" : "s"} left`, tone: "pink" };
  }
  return null;
}

const TONES: Record<Status["tone"], string> = {
  olive: "bg-olive-light text-olive",
  pink: "bg-warn-bg text-warn",
  muted: "bg-canvas text-muted",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide ${TONES[status.tone]}`}>
      {status.label}
    </span>
  );
}

export function EventCard({ event, onOpen }: { event: ClubEvent; onOpen: () => void }) {
  const status = eventStatus(event);
  const prices = event.ticketTypes.map((t) => t.priceCents);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const variedPrices = new Set(prices).size > 1;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-stretch gap-4 rounded-xl border border-line bg-paper p-4 text-left transition-colors duration-200 hover:border-[#cfcfc8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:gap-5 sm:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[13px] tabular-nums text-muted">{formatTimeRange(event.startDate, event.endDate)}</p>
        <h3 className="mt-1 text-pretty font-display text-[1.35rem] font-medium leading-snug tracking-tight text-ink">
          {event.name}
        </h3>
        {event.location && <p className="mt-2 truncate text-[13px] text-muted">{event.location}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {minPrice !== null && (
            <span className="text-[13px] font-medium tabular-nums text-ink">
              {variedPrices && <span className="font-normal text-muted">From </span>}
              {formatPrice(minPrice)}
            </span>
          )}
          {status && <StatusBadge status={status} />}
        </div>
      </div>
      <div className="flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas text-forest/80 sm:size-24">
        {event.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.thumbnail} alt="" className="size-full object-cover" />
        ) : (
          <CourtArt className="w-10 sm:w-12" />
        )}
      </div>
    </button>
  );
}
