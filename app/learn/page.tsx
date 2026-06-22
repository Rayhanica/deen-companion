import type { Metadata } from "next";
import { LearnCenter } from "@/components/features/learn-center";

export const metadata: Metadata = {
  title: "Learn"
};

export default function LearnPage() {
  return <LearnCenter />;
}
