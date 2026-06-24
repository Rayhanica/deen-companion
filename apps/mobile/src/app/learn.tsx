import { useState } from 'react';

import { Panel, Screen, SearchField, SectionTitle } from '@/components/screen';

const paths = [
  ['New Muslim path', 'A guided first 12 weeks covering belief, purification, salah, Quran, and community.'],
  ['Arabic path', 'Quran vocabulary, roots, morphology, reading, and grammar.'],
  ['Tajweed path', 'Makharij, characteristics, noon and meem rules, madd, stopping, and recitation practice.'],
  ['Student of knowledge', 'A structured reading and assessment path with source-linked lessons.'],
];

export default function LearnScreen() {
  const [query, setQuery] = useState('');
  return (
    <Screen eyebrow="Learn" title="Guided knowledge at your level">
      <SearchField value={query} onChangeText={setQuery} />
      <Panel
        meta="Ask Deen Companion"
        title="Research with sources"
        body="Choose quick answer, detailed research, Quran study, hadith study, Arabic tutor, or fatwa comparison."
        action="Open companion"
      />
      <SectionTitle>Learning paths</SectionTitle>
      {paths.map(([title, body]) => (
        <Panel key={title} title={title} body={body} action="View curriculum" />
      ))}
    </Screen>
  );
}
