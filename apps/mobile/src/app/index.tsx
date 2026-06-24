import { useState } from 'react';

import { Panel, Screen, SearchField, SectionTitle } from '@/components/screen';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  return (
    <Screen eyebrow="Wednesday, 24 June" title="Assalamu alaikum">
      <SearchField value={query} onChangeText={setQuery} />
      <Panel
        meta="Next prayer"
        title="Dhuhr in 2h 18m"
        body="Prayer times update from your saved location and calculation method."
        action="View prayer schedule"
      />
      <SectionTitle>Continue your journey</SectionTitle>
      <Panel
        meta="Quran"
        title="Continue Surah Al-Baqarah"
        body="Ayah 18 of 286 · 6% read"
        action="Open reader"
      />
      <Panel
        meta="Learning path"
        title="New Muslim foundations"
        body="Continue Wudu: purpose, sequence, and common mistakes."
        action="Resume lesson"
      />
      <SectionTitle>Today</SectionTitle>
      <Panel title="Daily ayah" body="Indeed, with hardship comes ease. Quran 94:6" />
      <Panel
        title="Daily challenge"
        body="Read one page of Quran after your next salah and record one reflection."
      />
      <Panel title="Weekly progress" body="4 learning sessions · 3 Quran sessions · 5 daily goals" />
    </Screen>
  );
}
