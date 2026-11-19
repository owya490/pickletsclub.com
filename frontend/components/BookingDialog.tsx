"use client";

import { useEffect, useRef, useState } from "react";
import { startBooking, type ClubEvent } from "@/lib/sportshub";
import { formatLongDate, formatPrice, formatTimeRange, sydneyDayKey } from "@/lib/format";
import { eventStatus, StatusBadge } from "./EventCard";
import { ClockIcon, CloseIcon, PinIcon } from "./icons";

const DEFAULT_MAX_TICKETS = 10;

type Phase =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "redirecting"; entryUrl: string }
  | { kind: "error"; message: string };

type Props = {
  event: ClubEvent | null;
  partnerKey: string;
  bookingEnabled: boolean;
  unconfirmed: boolean;
  onUnconfirmed: (eventId: string) => void;
  onClose: () => void;
};

export function BookingDialog({ event, partnerKey, bookingEnabled, unconfirmed, onUnconfirmed, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (event && !dialog.open) dialog.showModal();
    if (!event && dialog.open) dialog.close();
  }, [event]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => busy && e.preventDefault()}
      onClick={(e) => e.target === ref.current && !busy && ref.current?.close()}
      className="m-auto w-[min(32rem,calc(100%-2rem))] overflow-hidden rounded-2xl border border-line bg-paper p-0 text-ink shadow-[0_24px_80px_-24px_rgba(26,28,25,0.45)]"
    >
      {event && (
        <BookingForm
          key={event.eventId}
          event={event}
          partnerKey={partnerKey}
          bookingEnabled={bookingEnabled}
          unconfirmed={unconfirmed}
          onUnconfirmed={onUnconfirmed}
          onBusyChange={setBusy}
          onClose={() => ref.current?.close()}
        />
      )}
    </dialog>
  );
}

function BookingForm({
  event,
  partnerKey,
  bookingEnabled,
  unconfirmed,
  onUnconfirmed,
  onBusyChange,
  onClose,
}: Omit<Props, "event" | "onClose"> & {
  event: ClubEvent;
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
}) {
  const [ticketId, setTicketId] = useState(event.ticketTypes[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inFlight = useRef(false);

  const ticket = event.ticketTypes.find((t) => t.id === ticketId) ?? null;
  const status = eventStatus(event);
  const maxQuantity = Math.max(
    1,
    Math.min(
      event.maxTicketsPerTransaction ?? DEFAULT_MAX_TICKETS,
      ticket && !ticket.soldOut && ticket.vacancy !== null && ticket.vacancy > 0 ? ticket.vacancy : Infinity,
    ),
  );
  const qty = Math.min(quantity, maxQuantity);
  const joinsWaitlist = !!ticket?.soldOut && event.waitlistEnabled;
  const locked = phase.kind === "submitting" || phase.kind === "redirecting";

  async function book() {
    if (!ticket || inFlight.current || unconfirmed) return;
    inFlight.current = true;
    onBusyChange(true);
    setPhase({ kind: "submitting" });

    const result = await startBooking(partnerKey, event.eventId, ticket.id, qty);

    onBusyChange(false);
    if (result.kind === "ok") {
      setPhase({ kind: "redirecting", entryUrl: result.entryUrl });
      window.location.assign(result.entryUrl);
      return;
    }
    inFlight.current = false;
    if (result.kind === "unknown") {
      onUnconfirmed(event.eventId);
      setPhase({ kind: "idle" });
    } else if (result.kind === "access") {
      setPhase({ kind: "error", message: "Online booking is temporarily unavailable. Please check back soon." });
    } else {
      setPhase({
        kind: "error",
        message: result.message ?? "This booking couldn't be started. Try a different ticket or quantity.",
      });
    }
  }

  return (
    <div className="flex max-h-[85vh] flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="text-[13px] text-muted">{formatLongDate(sydneyDayKey(event.startDate))}</p>
          <h2 className="mt-1 text-pretty font-display text-[1.75rem] font-medium leading-tight tracking-tight">
            {event.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={phase.kind === "submitting"}
          className="-mr-1.5 rounded-md p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label="Close"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="space-y-1.5 text-sm text-muted">
          <p className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            {formatTimeRange(event.startDate, event.endDate)}
          </p>
          {event.location && (
            <p className="flex items-center gap-2">
              <PinIcon className="size-4" />
              {event.location}
            </p>
          )}
        </div>

        {event.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{event.description}</p>
        )}

        {event.ticketTypes.length === 0 ? (
          <p className="rounded-lg bg-canvas p-4 text-sm text-muted">
            Tickets for this session aren&apos;t available to book online yet.
          </p>
        ) : (
          <>
            <fieldset className="space-y-2" disabled={locked}>
              <legend className="mb-2 text-[12px] font-medium tracking-[0.08em] text-muted uppercase">Ticket</legend>
              {event.ticketTypes.map((t) => (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3.5 py-3 transition-colors ${
                    t.id === ticketId ? "border-forest ring-1 ring-forest" : "border-line hover:border-[#cfcfc8]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ticket"
                      checked={t.id === ticketId}
                      onChange={() => setTicketId(t.id)}
                      className="accent-forest"
                    />
                    <span className="text-sm font-semibold">{t.name}</span>
                  </span>
                  <span className="text-right text-sm">
                    <span className="font-medium tabular-nums">{formatPrice(t.priceCents)}</span>
                    {t.soldOut ? (
                      <span className="block text-xs text-muted">Sold out</span>
                    ) : (
                      t.vacancy !== null && <span className="block text-xs text-muted">{t.vacancy} left</span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium tracking-[0.08em] text-muted uppercase">Players</span>
              <div className="flex items-center overflow-hidden rounded-lg border border-line">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, qty - 1))}
                  disabled={locked || qty <= 1}
                  className="size-9 text-lg text-ink transition-colors hover:bg-canvas disabled:opacity-30"
                  aria-label="Fewer players"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxQuantity, qty + 1))}
                  disabled={locked || qty >= maxQuantity}
                  className="size-9 text-lg text-ink transition-colors hover:bg-canvas disabled:opacity-30"
                  aria-label="More players"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}

        {(status || event.bookingApprovalEnabled) && (
          <div className="flex flex-wrap gap-2">
            {status && <StatusBadge status={status} />}
            {event.bookingApprovalEnabled && (
              <StatusBadge status={{ label: "Organiser approval required", tone: "muted" }} />
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-line px-6 py-5">
        {unconfirmed ? (
          <p className="rounded-lg bg-warn-bg p-4 text-sm text-warn">
            We couldn&apos;t confirm your booking attempt. Please check your email for a confirmation before trying
            again.
          </p>
        ) : phase.kind === "error" ? (
          <p className="rounded-lg bg-warn-bg p-4 text-sm text-warn">{phase.message}</p>
        ) : phase.kind === "redirecting" ? (
          <p className="text-center text-sm text-muted">
            Taking you to checkout…{" "}
            <a href={phase.entryUrl} className="font-medium text-ink underline underline-offset-2">
              Continue
            </a>
          </p>
        ) : !bookingEnabled ? (
          <p className="text-center text-sm text-muted">Booking is disabled in this preview.</p>
        ) : null}

        <button
          type="button"
          onClick={book}
          disabled={!ticket || locked || unconfirmed || !bookingEnabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-forest px-6 text-[15px] font-medium text-paper transition-colors hover:bg-[#15281c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase.kind === "submitting"
            ? "Starting booking…"
            : joinsWaitlist
              ? "Join waitlist"
              : ticket
                ? `Book · ${formatPrice(ticket.priceCents * qty)}`
                : "Book"}
        </button>
        {event.acceptsStripe && ticket && ticket.priceCents > 0 && !joinsWaitlist && (
          <p className="text-center text-[12px] text-faint">Secure checkout with Stripe via SPORTSHUB</p>
        )}
      </div>
    </div>
  );
}
