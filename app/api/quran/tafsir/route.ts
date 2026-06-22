import { NextResponse } from "next/server";
import { getAyahTafsir } from "@/lib/api/quran";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ayahKey = searchParams.get("ayahKey");
    const tafsirId = searchParams.get("tafsirId") ?? "169";

    if (!ayahKey || !/^\d{1,3}:\d{1,3}$/.test(ayahKey)) {
      return NextResponse.json({ error: "A valid ayahKey such as 1:1 is required" }, { status: 400 });
    }

    return NextResponse.json(await getAyahTafsir(ayahKey, tafsirId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load tafsir" },
      { status: 502 }
    );
  }
}
