import { NextResponse } from "next/server";
import { getPrayerTimings } from "@/lib/api/prayer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return NextResponse.json(
      await getPrayerTimings({
        city: searchParams.get("city") ?? undefined,
        country: searchParams.get("country") ?? undefined,
        latitude: searchParams.get("latitude") ?? undefined,
        longitude: searchParams.get("longitude") ?? undefined,
        method: searchParams.get("method") ?? "2",
        school: searchParams.get("school") ?? "0"
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load prayer times" },
      { status: 502 }
    );
  }
}
