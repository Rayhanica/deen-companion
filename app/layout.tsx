import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { APP_NAME } from "@/lib/constants";
import { UserStateProvider } from "@/lib/user-state";
import { PwaRegister } from "@/components/features/pwa-register";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: "A modern all-in-one Islamic companion for Quran, prayer, hadith, duas, learning, and daily worship goals.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/deen-companion-icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: APP_NAME,
    description: "Your deen. One companion.",
    images: [
      {
        url: "/brand/deen-companion-logo.png",
        width: 1254,
        height: 1254,
        alt: "Deen Companion logo"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#2f5d50",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <UserStateProvider>
          <PwaRegister />
          <AppShell>{children}</AppShell>
        </UserStateProvider>
      </body>
    </html>
  );
}
