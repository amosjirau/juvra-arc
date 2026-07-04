import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter-ui",
  subsets: ["latin"],
});

const geistDisplay = Geist({
  variable: "--font-geist-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial high-contrast serif for display/headlines (paired with Inter for UI).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juvra",
  description: "The settlement layer for freelance commerce.",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`dark ${inter.variable} ${geistDisplay.variable} ${geistMono.variable} ${fraunces.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body className="antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
