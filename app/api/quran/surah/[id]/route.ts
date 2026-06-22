import { NextResponse } from "next/server";
import { getQuranPassage } from "@/lib/api/quran";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const surah = Number(id);
    if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
      return NextResponse.json({ error: "Invalid surah number" }, { status: 400 });
    }
    return NextResponse.json(await getQuranPassage("surah", surah));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Quran passage" },
      { status: 502 }
    );
  }
}
