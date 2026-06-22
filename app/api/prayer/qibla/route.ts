import { NextResponse } from "next/server";
import { getQibla } from "@/lib/api/prayer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }
    return NextResponse.json(await getQibla(latitude, longitude));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load qibla direction" },
      { status: 502 }
    );
  }
}
