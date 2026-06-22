import type { Metadata } from "next";
import { AiCompanion } from "@/components/features/ai-companion";

export const metadata: Metadata = {
  title: "AI Guide"
};

export default function AiPage() {
  return <AiCompanion />;
}
