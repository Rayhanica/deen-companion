import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/features/profile-dashboard";

export const metadata: Metadata = {
  title: "Profile"
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
