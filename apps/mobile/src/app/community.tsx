import { useState } from 'react';

import { Panel, Screen, SearchField, SectionTitle } from '@/components/screen';

export default function CommunityScreen() {
  const [query, setQuery] = useState('');
  return (
    <Screen eyebrow="Community" title="Learn and serve together">
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search masjids, classes, events, or teachers"
      />
      <Panel title="Masjid directory" body="Nearby prayer spaces, Jumu'ah schedules, services, and accessibility." />
      <Panel title="Halal directory" body="Restaurant discovery with direct halal-verification reminders." />
      <SectionTitle>Community activity</SectionTitle>
      <Panel title="Classes and study circles" body="Follow local and online programs from verified organizations." />
      <Panel title="Volunteer opportunities" body="Serve through food programs, mentoring, masjid support, and local aid." />
      <Panel title="Teacher profiles" body="Qualifications, subjects, languages, courses, and review status." />
    </Screen>
  );
}
