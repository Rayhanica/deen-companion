import type { Metadata } from "next";
import { LearningPaths } from "@/components/features/learning-paths";

export const metadata: Metadata = {
  title: "Learning Paths"
};

export default function LearningPathsPage() {
  return <LearningPaths />;
}
