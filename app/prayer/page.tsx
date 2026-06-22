import type { Metadata } from "next";
import { PrayerPanel } from "@/components/features/prayer-panel";

export const metadata: Metadata = {
  title: "Prayer"
};

export default function PrayerPage() {
  return <PrayerPanel />;
}
