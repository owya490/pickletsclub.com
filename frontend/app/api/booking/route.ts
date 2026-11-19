import { hasPartnerKey, startBooking } from "@/lib/sportshub";

export const dynamic = "force-dynamic";

const MAX_TICKETS = 100;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 128;
}

export async function POST(request: Request) {
  if (!hasPartnerKey()) {
    return Response.json({ kind: "access" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ kind: "rejected", message: null }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !isNonEmptyString((body as { eventId?: unknown }).eventId) ||
    !isNonEmptyString((body as { eventTicketTypeId?: unknown }).eventTicketTypeId) ||
    !Number.isInteger((body as { numTickets?: unknown }).numTickets) ||
    (body as { numTickets: number }).numTickets < 1 ||
    (body as { numTickets: number }).numTickets > MAX_TICKETS
  ) {
    return Response.json({ kind: "rejected", message: null }, { status: 400 });
  }

  const { eventId, eventTicketTypeId, numTickets } = body as {
    eventId: string;
    eventTicketTypeId: string;
    numTickets: number;
  };

  const result = await startBooking(eventId, eventTicketTypeId, numTickets);
  const status = result.kind === "ok" ? 200 : result.kind === "access" ? 403 : result.kind === "rejected" ? 422 : 502;
  return Response.json(result, { status });
}
