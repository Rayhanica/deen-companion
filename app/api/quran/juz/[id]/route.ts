import { NextResponse } from "next/server";
import { getQuranPassage } from "@/lib/api/quran";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const juz = Number(id);
    if (!Number.isInteger(juz) || juz < 1 || juz > 30) {
      return NextResponse.json({ error: "Invalid juz number" }, { status: 400 });
    }
    return NextResponse.json(await getQuranPassage("juz", juz));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load Quran passage" },
      { status: 502 }
    );
  }
}
