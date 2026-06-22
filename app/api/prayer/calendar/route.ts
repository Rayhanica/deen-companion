import { NextResponse } from "next/server";
import { getPrayerCalendar } from "@/lib/api/prayer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    return NextResponse.json(
      await getPrayerCalendar({
        city: searchParams.get("city") ?? "New York",
        country: searchParams.get("country") ?? "United States",
        method: searchParams.get("method") ?? "2",
        school: searchParams.get("school") ?? "0",
        month: searchParams.get("month") ?? String(new Date().getMonth() + 1),
        year: searchParams.get("year") ?? String(new Date().getFullYear())
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load prayer calendar" },
      { status: 502 }
    );
  }
}
