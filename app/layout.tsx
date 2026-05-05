import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Software Store",
  description: "Digital software products with order tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav className="flex gap-4 p-4 border-b bg-white">
          <Link href="/" className="text-blue-600">
            Home
          </Link>
          <Link href="/products" className="text-blue-600">
            Products
          </Link>
          <Link href="/track" className="text-blue-600">
            Track Order
          </Link>
        </nav>

        {children}

        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="hidden group-hover:block absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border p-4 w-56">
            <p className="font-bold mb-3">Need help?</p>

            <a
              href="https://wa.me/60168292446?text=Hello%2C%20I%20need%20help%20with%20my%20order."
              target="_blank"
              className="block bg-green-500 text-white text-center py-3 rounded-xl mb-2"
            >
              WhatsApp Support
            </a>

            <a
              href="https://t.me/17078876104"
              target="_blank"
              className="block bg-blue-500 text-white text-center py-3 rounded-xl mb-2"
            >
              Telegram Support
            </a>

            <a
              href="mailto:softcat918@gmail.com"
              className="block border text-center py-3 rounded-xl"
            >
              Email Support
            </a>
          </div>

          <button className="bg-green-500 text-white w-16 h-16 rounded-full shadow-xl text-2xl hover:scale-110 transition">
            💬
          </button>
        </div>
      </body>
    </html>
  );
}