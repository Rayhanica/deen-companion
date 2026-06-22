# API and Source Recommendations

## Quran
- **Primary MVP API:** Al Quran Cloud REST API for Quran text, translation, transliteration, surah/juz navigation, and recitation audio.
- **Production upgrade:** Quran Foundation/Quran.com Content APIs and JavaScript SDK for typed clients, richer content APIs, search, and user APIs when credentials are approved.

## Prayer times, Qibla, Islamic calendar
- **Primary MVP API:** AlAdhan API for timings by location/city, monthly calendar, calculation methods, school/madhab options, Hijri date data, and Qibla direction.

## Hadith
- **MVP approach:** Curated local seed content with collection/source references so the app is useful without a private API key.
- **Optional API:** Hadith API or Sunnah.com-compatible provider via a server-side API key. Never expose private keys to the browser.

## Duas and adhkar
- **MVP approach:** Curated JSON content with source references.
- **Production upgrade:** Add editorial workflow with scholar/content review, version history, and source verification.

## Accuracy policy
All Islamic learning content should remain sourced and reviewed. The app includes the disclaimer: “For personal learning. Ask a qualified scholar for specific rulings.”
