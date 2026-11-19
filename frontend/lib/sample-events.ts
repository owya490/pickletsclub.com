import type { ClubEvent } from "./sportshub";

/** Synthetic events shown when no SPORTSHUB partner key is configured. */
export function sampleEvents(): ClubEvent[] {
  const now = new Date();
  const at = (days: number, sydneyHour: number, minutes = 0) =>
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, sydneyHour - 11, minutes),
    ).toISOString();

  const base = {
    description: "",
    thumbnail: null,
    paused: false,
    waitlistEnabled: true,
    bookingApprovalEnabled: false,
    maxTicketsPerTransaction: 4,
    acceptsStripe: true,
  };

  return [
    {
      ...base,
      eventId: "sample-social",
      name: "Social Doubles Night",
      description: "Relaxed round-robin doubles. All levels welcome — paddles available to borrow.",
      location: "Moore Park Courts, NSW",
      startDate: at(1, 18),
      endDate: at(1, 20),
      ticketTypes: [{ id: "ga", name: "General Admission", priceCents: 1800, soldOut: false, vacancy: 6 }],
    },
    {
      ...base,
      eventId: "sample-beginners",
      name: "Beginners Clinic",
      description: "Learn the basics: serving, the kitchen line and dinking. Coached in small groups.",
      location: "Alexandria Sports Hall, NSW",
      startDate: at(3, 9, 30),
      endDate: at(3, 11),
      ticketTypes: [
        { id: "ga", name: "General Admission", priceCents: 2500, soldOut: false, vacancy: null },
        { id: "paddle", name: "Includes paddle hire", priceCents: 3000, soldOut: false, vacancy: null },
      ],
    },
    {
      ...base,
      eventId: "sample-ladder",
      name: "Intermediate Ladder",
      location: "Moore Park Courts, NSW",
      startDate: at(3, 18, 30),
      endDate: at(3, 20, 30),
      ticketTypes: [{ id: "ga", name: "General Admission", priceCents: 2000, soldOut: true, vacancy: 0 }],
    },
    {
      ...base,
      eventId: "sample-sunday",
      name: "Morning Open Play",
      location: "Centennial Park Courts, NSW",
      startDate: at(6, 8),
      endDate: at(6, 10),
      acceptsStripe: false,
      ticketTypes: [{ id: "ga", name: "General Admission", priceCents: 1500, soldOut: false, vacancy: 14 }],
    },
    {
      ...base,
      eventId: "sample-comp",
      name: "Picklets Club Cup",
      description: "Our monthly mixed doubles tournament. Register as a pair.",
      location: "Alexandria Sports Hall, NSW",
      startDate: at(12, 10),
      endDate: at(12, 15),
      maxTicketsPerTransaction: 2,
      bookingApprovalEnabled: true,
      ticketTypes: [{ id: "pair", name: "Pair entry", priceCents: 6000, soldOut: false, vacancy: 3 }],
    },
  ];
}
