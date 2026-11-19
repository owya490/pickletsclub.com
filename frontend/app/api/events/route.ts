import { FeedError, getEvents, hasPartnerKey, type FeedErrorKind } from "@/lib/sportshub";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasPartnerKey()) {
    return Response.json({ configured: false });
  }

  try {
    const events = await getEvents();
    return Response.json({ configured: true, events });
  } catch (err) {
    const error: FeedErrorKind = err instanceof FeedError ? err.kind : "unexpected";
    return Response.json({ configured: true, error }, { status: 502 });
  }
}
