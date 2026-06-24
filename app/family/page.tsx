import type { Metadata } from "next";
import { FamilyDashboard } from "@/components/features/family-dashboard";

export const metadata: Metadata = {
  title: "Family"
};

export default function FamilyPage() {
  return <FamilyDashboard />;
}
