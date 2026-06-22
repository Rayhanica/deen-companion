import type { Metadata } from "next";
import { HadithLibrary } from "@/components/features/hadith-library";

export const metadata: Metadata = {
  title: "Hadith"
};

export default function HadithPage() {
  return <HadithLibrary />;
}
