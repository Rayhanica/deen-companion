import { useState } from 'react';

import { Panel, Screen, SearchField, SectionTitle } from '@/components/screen';

export default function QuranScreen() {
  const [query, setQuery] = useState('');
  return (
    <Screen eyebrow="Quran" title="Read, understand, memorize">
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search surah, ayah, translation, or root"
      />
      <Panel
        meta="Continue reading"
        title="Surah Al-Baqarah"
        body="Ayah 18 · English translation · word-by-word study"
        action="Resume"
      />
      <SectionTitle>Study tools</SectionTitle>
      <Panel
        title="Tafsir and verse comparison"
        body="Compare trusted commentary, translations, cross-references, and related readings."
      />
      <Panel
        title="Root-word explorer"
        body="Study Quranic roots, morphology, vocabulary frequency, and occurrences."
      />
      <Panel
        title="Memorization"
        body="Spaced repetition, daily revision, mistake tracking, and teacher submissions."
      />
      <Panel title="Reflection journal" body="Private notes, highlights, linked sources, and tadabbur prompts." />
    </Screen>
  );
}
