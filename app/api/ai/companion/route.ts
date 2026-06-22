import { NextResponse } from "next/server";
import {
  deepLearningData,
  duasData,
  fatwasData,
  hadithData,
  historyStoriesData,
  knowledgeData
} from "@/lib/content";

type CompanionRequest = {
  question?: string;
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
  text?: string;
  annotations?: ResponseAnnotation[];
};

type ResponseOutputItem = {
  content?: ResponseContent[];
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: ResponseOutputItem[];
};

function compact(value: string, length = 220) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function localAnswer(question: string, focus: string, level: string) {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  const scored = [
    ...knowledgeData.map((item) => ({
      title: item.title,
      type: item.topic,
      body: item.summary,
      references: item.references
    })),
    ...deepLearningData.map((item) => ({
      title: item.title,
      type: item.track,
      body: `${item.summary} ${item.practice}`,
      references: item.references
    })),
    ...fatwasData.map((item) => ({
      title: item.question,
      type: item.topic,
      body: item.answer,
      references: item.references
    })),
    ...historyStoriesData.map((item) => ({
      title: item.title,
      type: item.category,
      body: item.summary,
      references: item.references
    })),
    ...hadithData.map((item) => ({
      title: item.title,
      type: item.category,
      body: item.text,
      references: [item.reference]
    })),
    ...duasData.map((item) => ({
      title: item.title,
      type: item.category,
      body: item.translation,
      references: [item.reference]
    }))
  ]
    .map((item) => ({
      ...item,
      score: terms.reduce((sum, term) => {
        const haystack = `${item.title} ${item.type} ${item.body} ${item.references.join(" ")}`.toLowerCase();
        return sum + (haystack.includes(term) ? 1 : 0);
      }, item.type.toLowerCase().includes(focus.toLowerCase()) ? 2 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const matches = scored.filter((item) => item.score > 0);
  const picks = matches.length ? matches : scored.slice(0, 3);

  return {
    mode: "local",
    answer: [
      `Here is a ${level.toLowerCase()}-friendly study path based on the app’s reviewed content.`,
      "",
      ...picks.map(
        (item, index) =>
          `${index + 1}. ${item.title}: ${compact(item.body)} References: ${item.references.join(", ")}.`
      ),
      "",
      "This is for personal learning. For specific rulings, ask a qualified scholar with your exact situation."
    ].join("\n"),
    citations: [] as Citation[]
  };
}

function extractTextAndCitations(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string") {
    return { text: payload.output_text, citations: [] as Citation[] };
  }

  const citations: Citation[] = [];
  const text = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          citations.push({ title: annotation.title ?? annotation.url, url: annotation.url });
        }
      }
      return content.text ?? "";
    })
    .filter(Boolean)
    .join("\n\n");

  return { text, citations };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompanionRequest;
    const question = body.question?.trim();
    const focus = body.focus?.trim() || "Quran";
    const level = body.level?.trim() || "Beginner";

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(localAnswer(question, focus, level));
    }

    const instructions = [
      "You are Deen Companion's Islamic learning guide.",
      "Be warm, clear, beginner-friendly, and source-aware.",
      "Do not issue definitive personal fatwas. For specific rulings, tell the user to ask a qualified scholar.",
      "When using web search, include clickable citations in the answer and prefer reliable Islamic or primary sources.",
      "Use concise sections: answer, next steps, references/cautions."
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
          `Focus: ${focus}`,
          `User progress: ${JSON.stringify(body.profile ?? {})}`,
          `Question: ${question}`
        ].join("\n"),
        reasoning: { effort: "low" },
        tools: body.enableWeb ? [{ type: "web_search" }] : undefined,
        tool_choice: body.enableWeb ? "auto" : undefined
      })
    });

    if (!aiResponse.ok) {
      const fallback = localAnswer(question, focus, level);
      return NextResponse.json({
        ...fallback,
        warning: "AI service was unavailable, so local content guidance was used."
      });
    }

    const payload = (await aiResponse.json()) as OpenAIResponsePayload;
    const { text, citations } = extractTextAndCitations(payload);

    return NextResponse.json({
      mode: body.enableWeb ? "ai-web" : "ai",
      answer: text || localAnswer(question, focus, level).answer,
      citations
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to answer right now" },
      { status: 500 }
    );
  }
}
