import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

const siteUrl = "https://www.pickletsclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Picklets Club · Pickleball bookings",
  description: "Book a pickleball session with Picklets Club.",
  openGraph: {
    title: "Picklets Club",
    description: "Book a pickleball session with Picklets Club.",
    url: siteUrl,
    siteName: "Picklets Club",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 2400,
        height: 1260,
        alt: "Picklets Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Picklets Club",
    description: "Book a pickleball session with Picklets Club.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
