import { NextResponse } from "next/server";
import { hadithData } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").toLowerCase();
  const category = (searchParams.get("category") ?? "").toLowerCase();

  const localResults = hadithData.filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.text.toLowerCase().includes(query) ||
      item.reference.toLowerCase().includes(query);
    const matchesCategory = !category || item.category.toLowerCase() === category;
    return matchesQuery && matchesCategory;
  });

  return NextResponse.json({
    source: process.env.HADITH_API_KEY ? "local-seed-with-api-ready" : "local-seed",
    results: localResults
  });
}
