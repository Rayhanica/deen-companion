import type { Metadata } from "next";
import { AiCompanion } from "@/components/features/ai-companion";

export const metadata: Metadata = {
  title: "Ask Deen Companion"
};

export default function AiPage() {
  return <AiCompanion />;
}
