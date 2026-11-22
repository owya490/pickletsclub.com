const API_URL =
  "https://australia-southeast1-socialsportsprod.cloudfunctions.net/globalAppController";
export const SPORTSHUB_URL = "https://www.sportshub.net.au";
export const FEATURED_COLLECTION_ID = "";
const BOOKING_ORIGIN = SPORTSHUB_URL;
const INIT_TIMEOUT_MS = 20_000;

export type TicketType = {
  id: string;
  name: string;
  priceCents: number;
  soldOut: boolean;
  vacancy: number | null;
};

export type ClubEvent = {
  eventId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  thumbnail: string | null;
  paused: boolean;
  waitlistEnabled: boolean;
  bookingApprovalEnabled: boolean;
  maxTicketsPerTransaction: number | null;
  acceptsStripe: boolean;
  ticketTypes: TicketType[];
};

export type FeedErrorKind = "access" | "server" | "unexpected" | "network";

export class FeedError extends Error {
  constructor(public kind: FeedErrorKind) {
    super(kind);
  }
}

export type BookingResult =
  | { kind: "ok"; entryUrl: string }
  | { kind: "rejected"; message: string | null }
  | { kind: "access" }
  | { kind: "unknown" };

const PERSONAL_FIELDS = ["email", "phone", "mobile", "firstName", "lastName", "attendees", "address"];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isNullableString = (v: unknown): v is string | null => v === null || isString(v);
const isTimestamp = (v: unknown): v is string => isString(v) && !Number.isNaN(Date.parse(v));

function post(partnerKey: string, body: unknown, signal?: AbortSignal) {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sportshub-Partner-Key": partnerKey,
    },
    credentials: "omit",
    cache: "no-store",
    body: JSON.stringify(body),
    signal,
  });
}

function safeImageUrl(v: string | null): string | null {
  if (!v) return null;
  try {
    const url = new URL(v);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function assertNoPersonalFields(obj: Record<string, unknown>) {
  const found = PERSONAL_FIELDS.filter((f) => f in obj);
  if (found.length) {
    console.error(`SPORTSHUB feed contained unexpected personal fields: ${found.join(", ")}`);
    throw new FeedError("unexpected");
  }
}

function parseTicket(raw: unknown): TicketType {
  if (
    !isObject(raw) ||
    !isString(raw.id) ||
    !isString(raw.name) ||
    !Number.isInteger(raw.priceCents) ||
    (raw.priceCents as number) < 0 ||
    !isBool(raw.soldOut) ||
    !(raw.vacancy === null || Number.isInteger(raw.vacancy))
  ) {
    throw new FeedError("unexpected");
  }
  assertNoPersonalFields(raw);
  return {
    id: raw.id,
    name: raw.name,
    priceCents: raw.priceCents as number,
    soldOut: raw.soldOut,
    vacancy: raw.vacancy as number | null,
  };
}

function parseEvent(raw: unknown): ClubEvent {
  if (
    !isObject(raw) ||
    !isString(raw.eventId) ||
    !isString(raw.name) ||
    !isString(raw.description) ||
    !isString(raw.location) ||
    !isTimestamp(raw.startDate) ||
    !isTimestamp(raw.endDate) ||
    !isNullableString(raw.thumbnail) ||
    !isNullableString(raw.image) ||
    !isBool(raw.paused) ||
    !isBool(raw.waitlistEnabled) ||
    !isBool(raw.bookingApprovalEnabled) ||
    !(
      raw.maxTicketsPerTransaction === null ||
      (Number.isInteger(raw.maxTicketsPerTransaction) && (raw.maxTicketsPerTransaction as number) > 0)
    ) ||
    !Array.isArray(raw.supportedPaymentProviders) ||
    !Array.isArray(raw.ticketTypes)
  ) {
    throw new FeedError("unexpected");
  }
  assertNoPersonalFields(raw);
  return {
    eventId: raw.eventId,
    name: raw.name,
    description: raw.description,
    location: raw.location,
    startDate: raw.startDate,
    endDate: raw.endDate,
    thumbnail: safeImageUrl(raw.thumbnail ?? raw.image),
    paused: raw.paused,
    waitlistEnabled: raw.waitlistEnabled,
    bookingApprovalEnabled: raw.bookingApprovalEnabled,
    maxTicketsPerTransaction: raw.maxTicketsPerTransaction as number | null,
    acceptsStripe: raw.supportedPaymentProviders.includes("STRIPE"),
    ticketTypes: raw.ticketTypes.map(parseTicket),
  };
}

async function fetchData(partnerKey: string, endpointType: string, data: unknown): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await post(partnerKey, { endpointType, data });
  } catch {
    throw new FeedError("network");
  }
  if (res.status === 401 || res.status === 403) throw new FeedError("access");
  if (!res.ok) throw new FeedError("server");

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new FeedError("unexpected");
  }
  if (!isObject(body) || !isObject(body.data)) throw new FeedError("unexpected");
  return body.data;
}

export async function getEvents(partnerKey: string): Promise<ClubEvent[]> {
  const data = await fetchData(partnerKey, "GET_PARTNER_EVENTS", {});
  if (!Array.isArray(data.events)) throw new FeedError("unexpected");
  return data.events.map(parseEvent);
}

export async function getBio(partnerKey: string): Promise<string> {
  const data = await fetchData(partnerKey, "GET_PARTNER_USER", {});
  if (!isString(data.bio)) throw new FeedError("unexpected");
  const bio = data.bio.trim();
  return bio.replace(/<[^>]*>|&nbsp;/g, "").trim() ? bio : "";
}

/** First upcoming event in the collection, or null when it has none. */
export async function getFeaturedEvent(partnerKey: string, eventCollectionId: string): Promise<ClubEvent | null> {
  const data = await fetchData(partnerKey, "GET_PARTNER_EVENT_COLLECTION", { eventCollectionId });
  if (!Array.isArray(data.events)) throw new FeedError("unexpected");
  return data.events.length ? parseEvent(data.events[0]) : null;
}

function isValidEntryUrl(v: unknown): v is string {
  if (!isString(v) || !v) return false;
  try {
    const url = new URL(v);
    return (
      url.origin === BOOKING_ORIGIN &&
      url.pathname.startsWith("/fulfilment/") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export async function startBooking(
  partnerKey: string,
  eventId: string,
  eventTicketTypeId: string,
  numTickets: number,
): Promise<BookingResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INIT_TIMEOUT_MS);
  try {
    const res = await post(
      partnerKey,
      {
        endpointType: "INIT_PARTNER_FULFILMENT_SESSION",
        data: { eventId, eventTicketTypeId, numTickets },
      },
      controller.signal,
    );
    if (res.status === 401 || res.status === 403) return { kind: "access" };
    if (res.status >= 500) return { kind: "unknown" };
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => null);
      const message = isObject(body) && isString(body.errorMessage) ? body.errorMessage : null;
      return { kind: "rejected", message };
    }
    const body: unknown = await res.json();
    if (isObject(body) && isObject(body.data) && isValidEntryUrl(body.data.entryUrl)) {
      return { kind: "ok", entryUrl: body.data.entryUrl };
    }
    return { kind: "unknown" };
  } catch {
    return { kind: "unknown" };
  } finally {
    clearTimeout(timer);
  }
}
