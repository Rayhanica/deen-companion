import tafsirGuides from "@/content/tafsir-guides.json";
import type { QuranAyah, QuranPassage, QuranTafsir } from "@/lib/types";

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
const QURAN_FOUNDATION_API_BASE = "https://apis.quran.foundation/content/api/v4";
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

type TafsirGuideData = {
  surahs: Array<{
    number: number;
    name: string;
    context: string;
    themes: string[];
    references: string[];
  }>;
  ayahs: Record<string, { summary: string; application: string }>;
};

const localTafsir = tafsirGuides as TafsirGuideData;

function quranComAyahUrl(ayahKey: string, tafsir = false) {
  const [surah, ayah] = ayahKey.split(":");
  const base = `https://quran.com/${surah}?startingVerse=${ayah}`;
  return tafsir ? `${base}&translations=131&tafsirs=169` : base;
}

async function getAyahTranslation(ayahKey: string) {
  try {
    const editions = await fetchAlQuran(`/ayah/${encodeURIComponent(ayahKey)}/editions/en.sahih`);
    const ayah = editions[0]?.ayahs?.[0] ?? (editions[0] as unknown as AlQuranAyah | undefined);
    return ayah?.text?.trim() ?? "";
  } catch {
    return "";
  }
}

async function fallbackReflection(ayahKey: string): Promise<QuranTafsir> {
  const surahNumber = Number(ayahKey.split(":")[0]);
  const guide = localTafsir.surahs.find((item) => item.number === surahNumber);
  const ayahGuide = localTafsir.ayahs[ayahKey];
  const translation = await getAyahTranslation(ayahKey);
  const text =
    ayahGuide?.summary ??
    (translation
      ? `This ayah communicates the following meaning in the selected English translation: ${translation} Read it as part of the argument and guidance of the surrounding passage, rather than as an isolated sentence.`
      : "Read this ayah with the surrounding passage, compare a reliable translation, and consult a recognized tafsir for its transmitted explanations and legal implications.");

  return {
    ayahKey,
    source: ayahGuide ? "Deen Companion curated verse guide" : "Deen Companion contextual study guide",
    text,
    context:
      guide?.context ??
      "This guide provides reading context, not an independent legal or theological interpretation. The ayah should be studied with its surrounding verses and a recognized tafsir.",
    themes: guide?.themes ?? ["Read in context", "Connect belief with action", "Consult recognized tafsir"],
    application:
      ayahGuide?.application ??
      "Write the central instruction, promise, warning, or description in your own words, then identify one responsible action it supports.",
    reflection: [
      "What does the ayah teach about Allah, guidance, human responsibility, or the Hereafter?",
      "How do the ayahs immediately before and after it shape the meaning?",
      "What question should be taken to a qualified teacher rather than answered from translation alone?"
    ],
    references: [...(guide?.references ?? []), "Quran Foundation: Tafsir Ibn Kathir resource 169"],
    sourceUrl: quranComAyahUrl(ayahKey),
    kind: "study-guide"
  };
}

export async function getAyahTafsir(ayahKey: string, tafsirId = "169") {
  const clientId = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const accessToken = process.env.QURAN_FOUNDATION_ACCESS_TOKEN;

  if (!clientId || !accessToken) return fallbackReflection(ayahKey);

  try {
    const response = await fetch(
      `${QURAN_FOUNDATION_API_BASE}/tafsirs/${tafsirId}/by_ayah/${encodeURIComponent(ayahKey)}?fields=resource_name,verse_key`,
      {
        headers: {
          "x-auth-token": accessToken,
          "x-client-id": clientId
        },
        next: { revalidate: 60 * 60 * 24 * 7 }
      }
    );

    if (!response.ok) return fallbackReflection(ayahKey);

    const payload = (await response.json()) as {
      tafsirs?: Array<{
        id?: number;
        resource_name?: string;
        text?: string;
        verse_key?: string;
      }>;
    };
    const record = payload.tafsirs?.[0];
    const text = stripHtml(record?.text ?? "");
    if (!text) return fallbackReflection(ayahKey);

    return {
      ayahKey,
      source: record?.resource_name ?? "Tafsir Ibn Kathir",
      text,
      context: localTafsir.surahs.find((item) => item.number === Number(ayahKey.split(":")[0]))?.context,
      themes: localTafsir.surahs.find((item) => item.number === Number(ayahKey.split(":")[0]))?.themes,
      application: localTafsir.ayahs[ayahKey]?.application,
      reflection: [
        "Which transmitted explanation clarifies the translation?",
        "How does the explanation connect this ayah to the surrounding passage?",
        "What belief, worship, or character response follows from the meaning?"
      ],
      references: [`Quran Foundation content resource ${tafsirId}`, "Tafsir Ibn Kathir"],
      sourceUrl: quranComAyahUrl(ayahKey, true),
      kind: "classical-tafsir"
    };
  } catch {
    return fallbackReflection(ayahKey);
  }
}
