
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

import UserProvider from "@/components/UserProvider";
import Navbar from "@/components/Navbar";
import { Wave, Leaf } from "@/components/Ornaments";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "EcoPassport AI",
  description:
    "Foto aksi ramah lingkunganmu, dapatkan cap di paspor hijau, dan naik peringkat.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3b2a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>
        <UserProvider>
          <Navbar />

          {children}

          <footer className="relative mt-16">
            <Wave
              className="block h-8 w-full"
              fill="var(--ink)"
            />

            <div className="flex items-center justify-center gap-2 bg-[var(--ink)] px-4 py-6 text-sm font-bold text-[var(--lime)]">
              <Leaf
                className="w-5"
                fill="var(--lime)"
                stroke="var(--lime)"
              />

              EcoPassport AI. Dibuat untuk Hacking Week.
            </div>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}
