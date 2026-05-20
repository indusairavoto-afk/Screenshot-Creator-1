import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const baseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ ok: false, error: "AI not configured" }, { status: 503 });
  }

  let body: { appName?: string; layout?: string; label?: string };
  try {
    body = (await req.json()) as { appName?: string; layout?: string; label?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { appName = "My App", layout = "device-bottom", label = "" } = body;

  const systemPrompt = `You are a mobile app marketing copywriter specializing in App Store screenshot headlines. Your headlines are short, punchy, benefit-focused, and emotionally resonant. They fit on 2 lines max, each line 1–5 words. Use newlines (\\n) to break lines intentionally for visual impact. Return exactly 3 headline options as a JSON array of strings, no explanation.`;

  const userPrompt = `App name: "${appName}"
Slide layout: ${layout}
Slide label (context): "${label || "none"}"

Write 3 compelling screenshot headlines for this app. Each headline should be 5–10 words total, split with \\n for a 2-line layout. Make them distinct from each other.

Respond with ONLY a JSON array like: ["Headline\\none", "Headline\\ntwo", "Headline\\nthree"]`;

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
        temperature: 0.85,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ ok: false, error: `AI error: ${text}` }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() || "[]";

    let suggestions: string[];
    try {
      const parsed = JSON.parse(raw) as unknown;
      suggestions = Array.isArray(parsed)
        ? (parsed as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 3)
        : [];
    } catch {
      const matches = raw.match(/"([^"]+)"/g);
      suggestions = matches ? matches.map((m) => m.slice(1, -1)).slice(0, 3) : [];
    }

    return NextResponse.json({ ok: true, suggestions });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
