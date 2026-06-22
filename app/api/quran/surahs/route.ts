import { NextResponse } from "next/server";
import { getSurahList } from "@/lib/api/quran";

export async function GET() {
  try {
    return NextResponse.json(await getSurahList());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load surahs" },
      { status: 502 }
    );
  }
}
