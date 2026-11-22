"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bio } from "@/components/Bio";
import { BookingDialog } from "@/components/BookingDialog";
import { Calendar } from "@/components/Calendar";
import { EventCard } from "@/components/EventCard";
import { dayHeading, formatLongDate, sydneyDayKey } from "@/lib/format";
import { sampleEvents } from "@/lib/sample-events";
import {
  FEATURED_COLLECTION_ID,
  FeedError,
  getBio,
  getEvents,
  getFeaturedEvent,
  SPORTSHUB_URL,
  type ClubEvent,
  type FeedErrorKind,
} from "@/lib/sportshub";

type Feed =
  | { state: "loading" }
  | { state: "error"; kind: FeedErrorKind }
  | { state: "ready"; events: ClubEvent[] };

export function Sessions({ partnerKey }: { partnerKey: string }) {
  const bookingEnabled = partnerKey.length > 0;
  const [feed, setFeed] = useState<Feed>({ state: "loading" });
  const [todayKey, setTodayKey] = useState("");
  const [month, setMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState<Set<string>>(new Set());
  const [bio, setBio] = useState("");
  const [featured, setFeatured] = useState<ClubEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTodayKey(sydneyDayKey(new Date()));

    if (!partnerKey) {
      setFeed({ state: "ready", events: sampleEvents() });
      return;
    }

    getBio(partnerKey)
      .then((text) => {
        if (!cancelled) setBio(text);
      })
      .catch(() => {});

    if (FEATURED_COLLECTION_ID) {
      getFeaturedEvent(partnerKey, FEATURED_COLLECTION_ID)
        .then((event) => {
          if (!cancelled) setFeatured(event);
        })
        .catch(() => {});
    }

    getEvents(partnerKey)
      .then((events) => {
        if (!cancelled) setFeed({ state: "ready", events });
      })
      .catch((err) => {
        if (!cancelled) setFeed({ state: "error", kind: err instanceof FeedError ? err.kind : "unexpected" });
      });

    return () => {
      cancelled = true;
    };
  }, [partnerKey]);

  const events = feed.state === "ready" ? feed.events : [];
  const groups = useMemo(() => {
    const byDay = new Map<string, ClubEvent[]>();
    for (const event of events) {
      const key = sydneyDayKey(event.startDate);
      byDay.set(key, [...(byDay.get(key) ?? []), event]);
    }
    return [...byDay.entries()];
  }, [events]);
  const eventDays = useMemo(() => new Set(groups.map(([key]) => key)), [groups]);
  const visibleGroups = selectedDay ? groups.filter(([key]) => key === selectedDay) : groups;
  const openEvent =
    events.find((e) => e.eventId === openEventId) ?? (featured?.eventId === openEventId ? featured : null);
  const calendarMonth = month ?? `${(groups[0]?.[0] ?? todayKey).slice(0, 7)}-01`;

  const sessionCount = events.length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 sm:px-8">
          <Image
            src="/picklets-logo.jpg"
            alt="Picklets Club logo"
            width={44}
            height={44}
            className="size-11 rounded-full border border-line"
            priority
          />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-ink">Picklets Club</p>
            <p className="mt-0.5 text-[13px] text-muted">Pickleball · Sydney</p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {featured ? (
          <div className="mb-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
            {bio && <Bio text={bio} className="lg:order-2" />}
            <section className="min-w-0 lg:order-1">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">Featured</h2>
              <div className="mt-3">
                <EventCard event={featured} onOpen={() => setOpenEventId(featured.eventId)} />
              </div>
            </section>
          </div>
        ) : (
          bio && <Bio text={bio} className="mb-10 max-w-2xl" />
        )}

        <main className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <section className="order-2 min-w-0 lg:order-1">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-[2.75rem]">
                  Sessions
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  Open play, clinics and club nights. Choose a session to book.
                </p>
              </div>
              {selectedDay && (
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-[#cfcfc8] hover:text-ink"
                >
                  {formatLongDate(selectedDay)}
                  <span className="text-faint" aria-hidden>
                    ·
                  </span>
                  <span className="font-medium text-ink">Show all</span>
                </button>
              )}
            </div>

            {feed.state === "loading" && (
              <div className="space-y-2" aria-busy>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-line bg-paper p-4 sm:p-5">
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-3 w-28 animate-pulse rounded bg-canvas" />
                      <div className="h-5 w-3/5 animate-pulse rounded bg-canvas" />
                      <div className="h-3 w-2/5 animate-pulse rounded bg-canvas" />
                    </div>
                    <div className="size-[4.5rem] animate-pulse rounded-lg bg-canvas sm:size-24" />
                  </div>
                ))}
              </div>
            )}

            {feed.state === "error" && (
              <Notice
                title="We couldn't load sessions"
                body={
                  feed.kind === "access"
                    ? "Online booking isn't available right now. Please check back soon."
                    : "Something went wrong on our end. Please refresh the page to try again."
                }
              />
            )}

            {feed.state === "ready" && groups.length === 0 && (
              <Notice title="No sessions scheduled" body="New sessions are added regularly — check back soon." />
            )}

            {visibleGroups.length > 0 && (
              <ol className="space-y-10">
                {visibleGroups.map(([key, dayEvents], index) => {
                  const heading = dayHeading(key, todayKey);
                  const last = index === visibleGroups.length - 1;
                  return (
                    <li key={key} className="relative pl-7">
                      {!last && (
                        <span className="absolute top-2 -bottom-10 left-[3px] w-px bg-line" aria-hidden />
                      )}
                      <span
                        className="absolute top-1.5 left-0 size-[7px] rounded-full bg-forest ring-[3px] ring-canvas"
                        aria-hidden
                      />
                      <h2 className="text-sm font-semibold tracking-tight text-ink">
                        {heading.primary}
                        <span className="ml-2 font-normal text-muted">{heading.secondary}</span>
                      </h2>
                      <div className="mt-3 space-y-2">
                        {dayEvents.map((event) => (
                          <EventCard key={event.eventId} event={event} onOpen={() => setOpenEventId(event.eventId)} />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              {todayKey && (
                <Calendar
                  month={calendarMonth}
                  todayKey={todayKey}
                  selectedDay={selectedDay}
                  eventDays={eventDays}
                  onSelectDay={setSelectedDay}
                  onMonthChange={setMonth}
                />
              )}
              {feed.state === "ready" && sessionCount > 0 && (
                <p className="mt-3 px-1 text-[13px] text-muted">
                  <span className="font-medium text-ink tabular-nums">{sessionCount}</span>{" "}
                  {sessionCount === 1 ? "upcoming session" : "upcoming sessions"}
                </p>
              )}
            </div>
          </aside>
        </main>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-medium text-ink">Picklets Club</span>
          <span className="inline-flex flex-wrap items-center gap-x-1.5">
            <span>Times in Sydney</span>
            <span aria-hidden>·</span>
            <a
              href={SPORTSHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-ink underline-offset-2 hover:underline"
            >
              Powered by
              <Image src="/sportshub-logo.png" alt="" width={16} height={16} className="size-4" />
              SPORTSHUB
            </a>
          </span>
        </div>
      </footer>

      <BookingDialog
        event={openEvent}
        partnerKey={partnerKey}
        bookingEnabled={bookingEnabled}
        unconfirmed={!!openEvent && unconfirmed.has(openEvent.eventId)}
        onUnconfirmed={(id) => setUnconfirmed((prev) => new Set(prev).add(id))}
        onClose={() => setOpenEventId(null)}
      />
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper px-6 py-14 text-center">
      <Image src="/picklets-logo.jpg" alt="" width={56} height={56} className="mx-auto size-14 rounded-full" />
      <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
