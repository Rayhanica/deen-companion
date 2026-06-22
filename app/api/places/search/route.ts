import { NextResponse } from "next/server";
import { findPlaces } from "@/lib/api/places";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "halal" ? "halal" : "masjid";
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    return NextResponse.json(
      await findPlaces({
        type,
        location: searchParams.get("location") ?? undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        radiusKm: Number(searchParams.get("radiusKm") ?? 8)
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to search nearby places" },
      { status: 502 }
    );
  }
}
