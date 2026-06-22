import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { APP_NAME } from "@/lib/constants";
import { UserStateProvider } from "@/lib/user-state";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: "A modern all-in-one Islamic companion for Quran, prayer, hadith, duas, learning, and daily worship goals.",
  manifest: "/manifest.webmanifest"
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
          <AppShell>{children}</AppShell>
        </UserStateProvider>
      </body>
    </html>
  );
}
