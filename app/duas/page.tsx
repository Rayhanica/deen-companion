import type { Metadata } from "next";
import { DuaLibrary } from "@/components/features/dua-library";

export const metadata: Metadata = {
  title: "Duas"
};

export default function DuasPage() {
  return <DuaLibrary />;
}
