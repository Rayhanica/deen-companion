import type { Metadata } from "next";
import { QuranReader } from "@/components/features/quran-reader";

export const metadata: Metadata = {
  title: "Quran"
};

export default function QuranPage() {
  return <QuranReader />;
}
