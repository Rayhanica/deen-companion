import type { QuranAyah, QuranPassage } from "@/lib/types";

type AlQuranEdition = {
  identifier: string;
  name: string;
};

type AlQuranAyah = {
  number: number;
  numberInSurah: number;
  juz: number;
  page?: number;
  text: string;
  audio?: string;
  surah?: {
    number: number;
    name: string;
    englishName: string;
  };
};

type AlQuranData = {
  number?: number;
  name?: string;
  englishName?: string;
  ayahs: AlQuranAyah[];
  edition?: AlQuranEdition;
};

const API_BASE = "https://api.alquran.cloud/v1";
const QURAN_COM_API_BASE = "https://api.quran.com/api/v4";
const EDITIONS = ["quran-uthmani", "en.sahih", "en.transliteration", "ar.alafasy"];

async function fetchAlQuran(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) {
    throw new Error(`Al Quran Cloud request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { data: AlQuranData[] | AlQuranData };
  return Array.isArray(payload.data) ? payload.data : [payload.data];
}

function normalizePassage(type: "surah" | "juz", id: number, editions: AlQuranData[]): QuranPassage {
  const arabic = editions.find((edition) => edition.edition?.identifier === "quran-uthmani") ?? editions[0];
  const translation = editions.find((edition) => edition.edition?.identifier === "en.sahih");
  const transliteration = editions.find((edition) => edition.edition?.identifier === "en.transliteration");
  const audio = editions.find((edition) => edition.edition?.identifier === "ar.alafasy");

  const ayahs: QuranAyah[] = arabic.ayahs.map((ayah, index) => {
    const surah = ayah.surah ?? {
      number: arabic.number ?? id,
      name: arabic.name ?? "",
      englishName: arabic.englishName ?? `Surah ${id}`
    };

    return {
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      juz: ayah.juz,
      page: ayah.page,
      surahNumber: surah.number,
      surahEnglishName: surah.englishName,
      surahName: surah.name,
      arabic: ayah.text,
      translation: translation?.ayahs[index]?.text ?? "",
      transliteration: transliteration?.ayahs[index]?.text ?? "",
      audio: audio?.ayahs[index]?.audio
    };
  });

  const first = ayahs[0];
  return {
    type,
    id,
    name: type === "surah" ? first?.surahEnglishName ?? `Surah ${id}` : `Juz ${id}`,
    subtitle:
      type === "surah"
        ? `${first?.surahName ?? ""} • ${ayahs.length} ayahs`
        : `${ayahs.length} ayahs across ${new Set(ayahs.map((ayah) => ayah.surahEnglishName)).size} surahs`,
    ayahs
  };
}

export async function getQuranPassage(type: "surah" | "juz", id: number) {
  const endpoint = `/${type}/${id}/editions/${EDITIONS.join(",")}`;
  const editions = await fetchAlQuran(endpoint);
  return normalizePassage(type, id, editions);
}

export async function getSurahList() {
  const response = await fetch(`${API_BASE}/surah`, {
    next: { revalidate: 60 * 60 * 24 * 7 }
  });
  if (!response.ok) throw new Error("Unable to load surah list");
  const payload = (await response.json()) as {
    data: Array<{ number: number; englishName: string; name: string; numberOfAyahs: number; revelationType: string }>;
  };
  return payload.data;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fallbackReflection(ayahKey: string) {
  return {
    ayahKey,
    source: "Deen Companion study notes",
    text:
      "A detailed tafsir service response was not available. Use the Arabic, translation, surrounding ayahs, and reliable tafsir sources to study the meaning. Avoid deriving personal legal rulings from a translation alone.",
    reflection: [
      "Read the ayah with the ayah before and after it.",
      "Identify what the ayah teaches about Allah, worship, character, or the Hereafter.",
      "Ask a qualified teacher for legal, theological, or sensitive interpretation questions."
    ],
    references: ["Quran.com tafsir resource", "For personal learning. Ask a qualified scholar for specific rulings."]
  };
}

export async function getAyahTafsir(ayahKey: string, tafsirId = "169") {
  const response = await fetch(`${QURAN_COM_API_BASE}/quran/tafsirs/${tafsirId}/by_ayah/${encodeURIComponent(ayahKey)}`, {
    next: { revalidate: 60 * 60 * 24 * 7 }
  });

  if (!response.ok) return fallbackReflection(ayahKey);

  const payload = (await response.json()) as {
    tafsir?: {
      id?: number;
      resource_name?: string;
      text?: string;
    };
  };

  const text = stripHtml(payload.tafsir?.text ?? "");
  if (!text) return fallbackReflection(ayahKey);

  return {
    ayahKey,
    source: payload.tafsir?.resource_name ?? "Quran.com tafsir",
    text,
    reflection: [
      "Read tafsir as explanation, not as a replacement for the Quran itself.",
      "Compare the theme with the ayah translation and surrounding passage.",
      "Turn the meaning into one practical action or dua."
    ],
    references: [`Quran.com tafsir resource ${payload.tafsir?.id ?? tafsirId}`, "Ibn Kathir (Abridged) when available"]
  };
}
