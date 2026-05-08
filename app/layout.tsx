import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoftDealsHub",
  description:
    "SoftDealsHub - Digital software marketplace for Windows, Office, Adobe, Autodesk and premium digital accounts.",
  keywords: [
    "software",
    "office",
    "windows",
    "digital products",
    "adobe",
    "autodesk",
    "office 365",
    "software keys",
  ],
  metadataBase: new URL("https://softdealshub.com"),

  openGraph: {
    title: "SoftDealsHub",
    description:
      "Premium digital software marketplace with instant delivery and order tracking.",
    url: "https://softdealshub.com",
    siteName: "SoftDealsHub",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SoftDealsHub",
    description:
      "Premium digital software marketplace with instant delivery and order tracking.",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
