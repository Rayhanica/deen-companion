import type { Metadata } from "next";
import { AdminContent } from "@/components/features/admin-content";

export const metadata: Metadata = {
  title: "Admin"
};

export default function AdminPage() {
  return <AdminContent />;
}
