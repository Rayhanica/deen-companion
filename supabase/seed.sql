insert into public.content_items (slug, type, title, category, body, references, status)
values
  (
    'morning-protection',
    'dua',
    'Morning protection',
    'morning',
    '{"arabic":"اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا","translation":"O Allah, by You we enter the morning and by You we enter the evening.","transliteration":"Allahumma bika asbahna wa bika amsayna"}',
    '[{"label":"Abu Dawud","detail":"Morning remembrance narration"}]',
    'published'
  ),
  (
    'salah-basics',
    'knowledge',
    'Salah basics',
    'salah',
    '{"summary":"Salah is the central daily act of worship. Begin with learning purification, prayer times, the movements, and the meanings of the core phrases.","points":["Pray at the appointed times.","Face the qibla when able.","Learn gradually and keep improving."]}',
    '[{"label":"Quran","detail":"4:103"},{"label":"Bukhari","detail":"Hadith on the pillars of Islam"}]',
    'published'
  ),
  (
    'intentional-daily-quran',
    'goal',
    'Read Quran daily',
    'quran',
    '{"target":"10 minutes","cadence":"daily","difficulty":"beginner"}',
    '[]',
    'published'
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  body = excluded.body,
  references = excluded.references,
  status = excluded.status;
