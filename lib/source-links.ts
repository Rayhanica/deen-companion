export type ResolvedReference = {
  label: string;
  url: string;
  provider: string;
  kind: "quran" | "hadith" | "book" | "web";
};

const hadithCollections = [
  { pattern: /(?:sahih\s+al-)?bukhari\s+(\d+[a-z]?)/i, slug: "bukhari", provider: "Sunnah.com" },
  { pattern: /(?:sahih\s+)?muslim\s+(\d+[a-z]?)/i, slug: "muslim", provider: "Sunnah.com" },
  { pattern: /(?:jami\s+at-)?tirmidhi\s+(\d+[a-z]?)/i, slug: "tirmidhi", provider: "Sunnah.com" },
  { pattern: /(?:sunan\s+)?abu\s+dawud\s+(\d+[a-z]?)/i, slug: "abudawud", provider: "Sunnah.com" },
  { pattern: /(?:sunan\s+)?ibn\s+majah\s+(\d+[a-z]?)/i, slug: "ibnmajah", provider: "Sunnah.com" },
  { pattern: /(?:sunan\s+)?an-?nasai\s+(\d+[a-z]?)/i, slug: "nasai", provider: "Sunnah.com" },
  { pattern: /riyad(?:\s+as-?salihin)?\s+(\d+[a-z]?)/i, slug: "riyadussalihin", provider: "Sunnah.com" }
];

export function resolveReference(reference: string): ResolvedReference {
  const quran = reference.match(/quran\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?/i);
  if (quran) {
    const surah = quran[1];
    const ayah = quran[2];
    const url = ayah ? `https://quran.com/${surah}?startingVerse=${ayah}` : `https://quran.com/${surah}`;
    return { label: reference, url, provider: "Quran.com", kind: "quran" };
  }

  for (const collection of hadithCollections) {
    const match = reference.match(collection.pattern);
    if (match) {
      return {
        label: reference,
        url: `https://sunnah.com/${collection.slug}:${match[1]}`,
        provider: collection.provider,
        kind: "hadith"
      };
    }
  }

  if (/hadith jibril/i.test(reference)) {
    return {
      label: reference,
      url: "https://sunnah.com/muslim:8a",
      provider: "Sunnah.com",
      kind: "hadith"
    };
  }

  if (/ibn kathir/i.test(reference)) {
    return {
      label: reference,
      url: "https://quran.com/tafsirs/en-tafisr-ibn-kathir",
      provider: "Quran.com",
      kind: "book"
    };
  }

  if (/mushaf|tajweed|quran literacy|waqf|recitation rules/i.test(reference)) {
    return {
      label: reference,
      url: "https://quran.com/learning",
      provider: "Quran.com Learning",
      kind: "book"
    };
  }

  if (/seerah|ibn ishaq|ibn hisham/i.test(reference)) {
    return {
      label: reference,
      url: `/learn?mode=sources&query=${encodeURIComponent(reference)}`,
      provider: "Deen Companion source search",
      kind: "book"
    };
  }

  return {
    label: reference,
    url: `/learn?mode=sources&query=${encodeURIComponent(reference)}`,
    provider: "Deen Companion source search",
    kind: "web"
  };
}

export function resolveReferences(references: string[]) {
  const seen = new Set<string>();
  return references
    .map(resolveReference)
    .filter((reference) => {
      if (seen.has(reference.url)) return false;
      seen.add(reference.url);
      return true;
    });
}
