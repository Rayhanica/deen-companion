import { NextResponse } from "next/server";
import { searchSourceIndex } from "@/lib/source-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const type = (searchParams.get("type") ?? "all").trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [], error: "Enter at least two characters." }, { status: 400 });
  }

  try {
    const results = await searchSourceIndex(query, type);
    return NextResponse.json({
      results,
      index: {
        quranAyahs: 6236,
        quranSurahs: 114,
        localResources: "reviewed learning guides, hadith, duas, history, and rulings"
      }
    });
  } catch {
    return NextResponse.json({ results: [], error: "Source search is temporarily unavailable." }, { status: 502 });
  }
}
