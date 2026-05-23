import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <body>
  {children}

  <Script id="tawk-to" strategy="afterInteractive">
    {`
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/6a116ff662b0761c3d8d5e2b/1jpa1qnql';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();
    `}
  </Script>
</body>
    </html>
  );
}
