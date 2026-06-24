import { Panel, Screen, SectionTitle } from '@/components/screen';

export default function ProfileScreen() {
  return (
    <Screen eyebrow="Profile" title="Your lifelong learning record">
      <Panel title="Guest mode" body="Sign in to sync notes, goals, memorization, courses, and offline packs." action="Sign in" />
      <SectionTitle>Your spaces</SectionTitle>
      <Panel title="Personal knowledge vault" body="Saved ayahs, hadith, highlights, reflections, collections, and study notes." />
      <Panel title="Family dashboard" body="Child profiles, learning assignments, Quran progress, salah habits, and family goals." />
      <Panel title="Goals and progress" body="Daily worship, study plans, streaks, milestones, and weekly review." />
      <Panel title="Settings" body="Language, accessibility, prayer calculation, madhab, notifications, downloads, and privacy." />
    </Screen>
  );
}
