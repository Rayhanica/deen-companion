import type { PlaceResult } from "@/lib/types";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "DeenCompanion/0.1 (Islamic learning app)";

function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radius = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function addressFromTags(tags: Record<string, string>) {
  return [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"]
  ]
    .filter(Boolean)
    .join(", ");
}

async function geocodeLocation(location: string) {
  const params = new URLSearchParams({
    q: location,
    format: "json",
    limit: "1"
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    },
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) throw new Error("Location search failed");
  const data = (await response.json()) as NominatimResult[];
  const first = data[0];
  if (!first) throw new Error("Location not found");
  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    label: first.display_name ?? location
  };
}

function buildQuery(type: "masjid" | "halal", latitude: number, longitude: number, radiusMeters: number) {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  const filters =
    type === "masjid"
      ? [
          `node["amenity"="place_of_worship"]["religion"="muslim"]${around};`,
          `way["amenity"="place_of_worship"]["religion"="muslim"]${around};`,
          `relation["amenity"="place_of_worship"]["religion"="muslim"]${around};`
        ]
      : [
          `node["amenity"~"restaurant|fast_food|cafe"]["diet:halal"="yes"]${around};`,
          `way["amenity"~"restaurant|fast_food|cafe"]["diet:halal"="yes"]${around};`,
          `relation["amenity"~"restaurant|fast_food|cafe"]["diet:halal"="yes"]${around};`,
          `node["amenity"~"restaurant|fast_food|cafe"]["halal"="yes"]${around};`,
          `way["amenity"~"restaurant|fast_food|cafe"]["halal"="yes"]${around};`,
          `relation["amenity"~"restaurant|fast_food|cafe"]["halal"="yes"]${around};`
        ];

  return `[out:json][timeout:25];(${filters.join("")});out center tags 40;`;
}

export async function findPlaces(params: {
  type: "masjid" | "halal";
  location?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}) {
  const radiusKm = Math.min(Math.max(params.radiusKm ?? 8, 1), 50);
  const origin =
    typeof params.latitude === "number" && typeof params.longitude === "number"
      ? { latitude: params.latitude, longitude: params.longitude, label: "Current location" }
      : await geocodeLocation(params.location || "New York, United States");

  const query = buildQuery(params.type, origin.latitude, origin.longitude, Math.round(radiusKm * 1000));
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": USER_AGENT
    },
    body: new URLSearchParams({ data: query }),
    next: { revalidate: 60 * 15 }
  });

  if (!response.ok) throw new Error("Nearby search failed");
  const data = (await response.json()) as OverpassResponse;

  const results = data.elements
    .reduce<PlaceResult[]>((items, element) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      const tags = element.tags ?? {};
      if (!latitude || !longitude) return items;
      items.push({
        id: `${element.type}-${element.id}`,
        type: params.type,
        name: tags.name ?? (params.type === "masjid" ? "Masjid" : "Halal restaurant"),
        latitude,
        longitude,
        distanceKm: Number(distanceKm(origin, { latitude, longitude }).toFixed(2)),
        address: addressFromTags(tags),
        phone: tags.phone ?? tags["contact:phone"],
        website: tags.website ?? tags["contact:website"],
        tags
      });
      return items;
    }, [])
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .slice(0, 30);

  return {
    origin,
    attribution: "Place data © OpenStreetMap contributors, available under the Open Database License.",
    results
  };
}
