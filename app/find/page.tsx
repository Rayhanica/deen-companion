import type { Metadata } from "next";
import { PlaceFinder } from "@/components/features/place-finder";

export const metadata: Metadata = {
  title: "Find Nearby"
};

export default function FindPage() {
  return <PlaceFinder />;
}
