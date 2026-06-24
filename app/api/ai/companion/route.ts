import { NextResponse } from "next/server";
import {
  deepLearningData,
  duasData,
  fatwasData,
  hadithData,
  historyStoriesData,
  studyGuidesData
} from "@/lib/content";
import { resolveReferences } from "@/lib/source-links";
import { retrieveKnowledge } from "@/lib/search/retrieval";

type CompanionRequest = {
  question?: string;
  mode?: string;
  focus?: string;
  level?: string;
  enableWeb?: boolean;
  profile?: {
    bookmarks?: number;
    memorized?: number;
    dailyGoal?: number;
  };
};

type Citation = {
  title: string;
  url: string;
};

type ResponseAnnotation = {
  type?: string;
  title?: string;
  url?: string;
};

type ResponseContent = {
  type?: string;
  text?: string;
  annotations?: ResponseAnnotation[];
};

type ResponseOutputItem = {
  type?: string;
  content?: ResponseContent[];
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: ResponseOutputItem[];
};

type LocalMatch = {
  id: string;
  title: string;
  type: string;
  body: string;
  references: string[];
  url: string;
  score: number;
};

const capabilities = {
  generativeAi: Boolean(process.env.OPENAI_API_KEY),
  sourceResearch: true,
  quranAyahsIndexed: 6236,
  model: process.env.OPENAI_MODEL ?? "gpt-5.5"
};

function compact(value: string, length = 260) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function questionTerms(question: string) {
  const stopWords = new Set([
    "about",
    "build",
    "could",
    "explain",
    "from",
    "have",
    "how",
    "into",
    "should",
    "that",
    "their",
    "there",
    "these",
    "this",
    "through",
    "what",
    "when",
    "where",
    "which",
    "with",
    "would",
    "your"
  ]);
  return question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function localMatches(question: string, focus: string): LocalMatch[] {
  const terms = questionTerms(question);
  const items = [
    ...studyGuidesData.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.topic,
      body: `${item.overview} ${item.sections.flatMap((section) => section.paragraphs).join(" ")}`,
      references: item.references,
      url: `/learn?mode=knowledge&resource=${item.id}#${item.id}`
    })),
    ...deepLearningData.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.track,
      body: `${item.summary} ${item.reading.join(" ")} ${item.practice}`,
      references: item.references,
      url: `/learn?mode=lessons&resource=${item.id}#${item.id}`
    })),
    ...fatwasData.map((item) => ({
      id: item.id,
      title: item.question,
      type: item.topic,
      body: item.answer,
      references: item.references,
      url: `/learn?mode=fatwas&resource=${item.id}#${item.id}`
    })),
    ...historyStoriesData.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.category,
      body: `${item.summary} ${item.lessons.join(" ")}`,
      references: item.references,
      url: `/learn?mode=stories&resource=${item.id}#${item.id}`
    })),
    ...hadithData.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.category,
      body: item.text,
      references: [item.reference],
      url: "/learn/hadith"
    })),
    ...duasData.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.category,
      body: item.translation,
      references: [item.reference],
      url: "/duas"
    }))
  ];

  return items
    .map((item) => {
      const title = item.title.toLowerCase();
      const type = item.type.toLowerCase();
      const body = item.body.toLowerCase();
      const references = item.references.join(" ").toLowerCase();
      const score =
        terms.reduce(
          (sum, term) =>
            sum +
            (title.includes(term) ? 6 : 0) +
            (type.includes(term) ? 4 : 0) +
            (body.includes(term) ? 2 : 0) +
            (references.includes(term) ? 1 : 0),
          0
        ) + (type.includes(focus.toLowerCase()) ? 1 : 0);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function citationsForMatches(matches: LocalMatch[]) {
  const citations: Citation[] = [];
  for (const match of matches) {
    citations.push({ title: match.title, url: match.url });
    for (const reference of resolveReferences(match.references)) {
      citations.push({ title: `${reference.label} · ${reference.provider}`, url: reference.url });
    }
  }

  const seen = new Set<string>();
  return citations.filter((citation) => {
    if (seen.has(citation.url)) return false;
    seen.add(citation.url);
    return true;
  });
}

function localAnswer(question: string, focus: string, level: string) {
  const scored = localMatches(question, focus);
  const relevant = scored.filter((item) => item.score > 0);
  const picks = relevant.length ? relevant : scored.slice(0, 3);

  return {
    mode: "local" as const,
    answer: [
      `${level}-friendly guidance from the reviewed Deen Companion library:`,
      "",
      ...picks.map((item, index) => `${index + 1}. ${item.title}\n${compact(item.body)}`),
      "",
      "Next step: open the linked lessons and primary references below. For a ruling about your exact circumstances, ask a qualified scholar."
    ].join("\n"),
    citations: citationsForMatches(picks),
    confidence: {
      level: relevant.length >= 3 ? ("medium" as const) : ("low" as const),
      basis: relevant.length
        ? "Matched against reviewed local lessons and source-linked content."
        : "No close keyword match was found, so the answer uses general reviewed learning material."
    },
    scholarlyDifferences: {
      status: "not_assessed",
      note: "This quick answer does not infer consensus. Use Fatwa Comparison mode for reviewed opinion records and evidences."
    },
    capabilities
  };
}

async function researchAnswer(question: string, level: string) {
  const sourceResults = await retrieveKnowledge(question);
  const sourcePicks = sourceResults.slice(0, 8);
  const citations = sourceResults.slice(0, 18).map((result) => ({
    title: `${result.reference} · ${result.title}`,
    url: result.url
  }));
  const seen = new Set<string>();

  return {
    mode: "research" as const,
    answer: [
      `${level}-friendly source research for: ${question}`,
      "",
      sourcePicks.length ? "Closest primary and indexed sources:" : "No exact primary-source keyword match was found.",
      ...sourcePicks.map((result, index) => `${index + 1}. ${result.reference}\n${compact(result.excerpt, 220)}`),
      "",
      "Read the linked passages in context. A keyword result is evidence to study, not a personal ruling. Ask a qualified scholar when circumstances, legal-school differences, health, finance, marriage, or another person’s rights are involved."
    ].join("\n"),
    citations: citations.filter((citation) => {
      if (seen.has(citation.url)) return false;
      seen.add(citation.url);
      return true;
    }).slice(0, 18),
    warning: process.env.OPENAI_API_KEY
      ? undefined
      : "Generative AI is not configured. Source research is active and searches the app library plus all 6,236 translated Quran ayahs.",
    confidence: {
      level: sourcePicks.length >= 3 ? "medium" : "low",
      basis: "Keyword and verified-database retrieval. Sources must be read in context."
    },
    scholarlyDifferences: {
      status: "not_assessed",
      note: "Source search does not infer consensus. Detailed Research mode with reviewed opinion records is required for comparison."
    },
    capabilities
  };
}

function extractTextAndCitations(payload: OpenAIResponsePayload) {
  const citations: Citation[] = [];
  const text = (payload.output ?? [])
    .filter((item) => item.type === "message" || item.content?.length)
    .flatMap((item) => item.content ?? [])
    .map((content) => {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          citations.push({ title: annotation.title ?? annotation.url, url: annotation.url });
        }
      }
      return content.type === "output_text" || content.text ? content.text ?? "" : "";
    })
    .filter(Boolean)
    .join("\n\n");

  const seen = new Set<string>();
  return {
    text: text || payload.output_text || "",
    citations: citations.filter((citation) => {
      if (seen.has(citation.url)) return false;
      seen.add(citation.url);
      return true;
    })
  };
}

export function GET() {
  return NextResponse.json(capabilities);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompanionRequest;
    const question = body.question?.trim();
    const mode = body.mode?.trim() || "Quick Answer";
    const focus = body.focus?.trim() || "Quran";
    const level = body.level?.trim() || "Beginner";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(body.enableWeb ? await researchAnswer(question, level) : localAnswer(question, focus, level));
    }

    const instructions = [
      "You are Deen Companion's Islamic learning guide.",
      "Give a clear, beginner-friendly educational answer with practical next steps.",
      "Do not issue a definitive personal fatwa. For specific circumstances, explain what details matter and advise consulting a qualified scholar.",
      "Distinguish Quran text, authentic hadith, scholarly interpretation, institutional guidance, and general educational material.",
      "When web search is enabled, cite claims and prefer primary or established sources such as quran.com, sunnah.com, Quran Foundation, recognized fatwa institutions, and university or publisher sources.",
      "Do not present a search snippet as a ruling. Use concise sections: Answer, Study next, Sources and cautions."
    ].join("\n");

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.5",
        instructions,
        input: [
          `User level: ${level}`,
          `Companion mode: ${mode}`,
          `Focus: ${focus}`,
          `User progress: ${JSON.stringify(body.profile ?? {})}`,
          `Question: ${question}`
        ].join("\n"),
        reasoning: { effort: body.enableWeb ? "medium" : "low" },
        max_output_tokens: 1400,
        tools: body.enableWeb ? [{ type: "web_search", search_context_size: "medium" }] : undefined,
        tool_choice: body.enableWeb ? "auto" : undefined
      })
    });

    if (!aiResponse.ok) {
      const fallback = body.enableWeb ? await researchAnswer(question, level) : localAnswer(question, focus, level);
      return NextResponse.json({
        ...fallback,
        warning: "The OpenAI request was unavailable, so Deen Companion used its reviewed local and source-search fallback."
      });
    }

    const payload = (await aiResponse.json()) as OpenAIResponsePayload;
    const { text, citations } = extractTextAndCitations(payload);
    const fallback = localAnswer(question, focus, level);

    return NextResponse.json({
      mode: body.enableWeb ? "ai-web" : "ai",
      answer: text || fallback.answer,
      citations: citations.length ? citations : fallback.citations,
      confidence: {
        level: citations.length >= 2 ? "medium" : "low",
        basis: body.enableWeb ? "Generated answer with linked web citations." : "Generated answer grounded by the configured model and local fallback links."
      },
      scholarlyDifferences: {
        status: "requires_review",
        note: "The answer should only label consensus or valid disagreement when the retrieved records explicitly contain that classification."
      },
      capabilities
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to answer right now" },
      { status: 500 }
    );
  }
}
