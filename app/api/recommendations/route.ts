import { NextResponse } from "next/server";
import { learningPathsData, studyGuidesData } from "@/lib/content";
import type { RecommendationItem } from "@/lib/types";

type RequestBody = {
  journeyStage?: string;
  interests?: string[];
  memorizedAyahs?: string[];
  enrolledPaths?: string[];
  completedLessons?: string[];
  hijriMonth?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const interests = body.interests ?? [];
  const recommendations: RecommendationItem[] = [];

  const path =
    learningPathsData.find((item) => (body.enrolledPaths ?? []).includes(item.id)) ??
    learningPathsData.find((item) =>
      body.journeyStage === "new-muslim"
        ? item.id === "new-muslim-12-weeks"
        : interests.some((interest) => `${item.title} ${item.description}`.toLowerCase().includes(interest.toLowerCase()))
    ) ??
    learningPathsData[0];

  recommendations.push({
    id: `course-${path.id}`,
    type: "course",
    title: path.title,
    reason: (body.enrolledPaths ?? []).includes(path.id) ? "Continue your active path" : "Matches your journey stage and interests",
    href: `/learn/paths?path=${path.id}`
  });

  if ((body.memorizedAyahs ?? []).length) {
    const key = body.memorizedAyahs?.at(-1) ?? "112:1";
    recommendations.push({
      id: `review-${key}`,
      type: "review",
      title: `Review ayah ${key}`,
      reason: "Recently memorized material should be revised before adding more",
      href: "/quran"
    });
  }

  const article =
    studyGuidesData.find((item) =>
      interests.some((interest) => `${item.topic} ${item.title}`.toLowerCase().includes(interest.toLowerCase()))
    ) ?? studyGuidesData[0];
  recommendations.push({
    id: `article-${article.id}`,
    type: "article",
    title: article.title,
    reason: "Related to your saved interests",
    href: `/learn?mode=knowledge&resource=${article.id}#${article.id}`
  });

  if (body.hijriMonth === 9) {
    recommendations.unshift({
      id: "season-ramadan",
      type: "article",
      title: "Fasting Ramadan with understanding",
      reason: "Seasonal recommendation for Ramadan",
      href: "/learn?mode=knowledge&resource=fasting-ramadan#fasting-ramadan"
    });
  }

  return NextResponse.json({ recommendations: recommendations.slice(0, 6) });
}
