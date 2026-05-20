import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SlideText = { id: string; headline: string; label: string };

export async function POST(req: Request) {
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ ok: false, error: "AI not configured" }, { status: 503 });
  }

  let body: { slides?: SlideText[]; targetLanguage?: string; targetCode?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { slides, targetLanguage, targetCode } = body;
  if (!slides?.length || !targetLanguage || !targetCode) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const systemPrompt = `You are a professional app store marketing translator. Translate slide content from English to the target language while:
- Preserving \\n line breaks exactly — they control visual layout
- Keeping labels SHORT, UPPERCASE, 1–3 words
- Maintaining punchy, concise marketing tone
- Using culturally natural phrasing for the target market
- Never adding extra words or punctuation

Respond ONLY with a valid JSON array matching the input structure.`;

  const slidesJson = JSON.stringify(slides.map((s) => ({
    id: s.id,
    headline: s.headline,
    label: s.label,
  })));

  const userPrompt = `Translate these App Store screenshot slides to ${targetLanguage} (locale code: ${targetCode}).

Input slides (JSON):
${slidesJson}

Return a JSON array with the same structure: [{id, headline, label}]
Preserve \\n in headlines. Labels must stay UPPERCASE and SHORT.`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ ok: false, error: `AI error: ${text}` }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() || "{}";

    let translations: SlideText[];
    try {
      const parsed = JSON.parse(raw) as unknown;
      const arr = Array.isArray(parsed)
        ? parsed
        : (typeof parsed === "object" && parsed !== null && Array.isArray((parsed as Record<string, unknown>).slides))
          ? (parsed as Record<string, unknown[]>).slides
          : (typeof parsed === "object" && parsed !== null && Array.isArray((parsed as Record<string, unknown>).translations))
            ? (parsed as Record<string, unknown[]>).translations
            : [];
      translations = (arr as unknown[]).map((item) => {
        const s = item as Record<string, unknown>;
        return {
          id: String(s.id || ""),
          headline: String(s.headline || ""),
          label: String(s.label || ""),
        };
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, translations });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
