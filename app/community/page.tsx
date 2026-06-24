import type { Metadata } from "next";
import { CommunityHub } from "@/components/features/community-hub";

export const metadata: Metadata = {
  title: "Community"
};

export default function CommunityPage() {
  return <CommunityHub />;
}
