import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { z } from "zod";
import { getAiLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { sanitizeBio } from "@/lib/sanitize";

const enhanceSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(["bio", "approach", "first_visit", "conditions", "procedures"]),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

// Models to try in order (primary + fallbacks)
const AI_MODELS = [
  "xiaomi/mimo-v2-flash:free",
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
];

// Token limits based on length preference
const LENGTH_TOKENS: Record<string, number> = {
  short: 150,   // ~50-75 words
  medium: 300,  // ~100-150 words
  long: 500,    // ~200-250 words
};

// Length instructions to append to system prompts
const LENGTH_INSTRUCTIONS: Record<string, string> = {
  short: "\n\nIMPORTANT: Keep your response very concise, under 75 words. Be brief but impactful.",
  medium: "\n\nKeep your response moderate in length, around 100-150 words.",
  long: "\n\nProvide a detailed, comprehensive response, up to 250 words.",
};

// System prompts for different content types
const SYSTEM_PROMPTS: Record<string, string> = {
  bio: `You are an expert medical copywriter helping doctors write professional bios.
Enhance the provided text to be more professional, engaging, and patient-friendly.
Keep the tone warm but authoritative.
Maintain factual accuracy - don't add credentials or details not mentioned.
Keep the response concise (under 300 words).
Return only the enhanced text, no explanations.`,

  approach: `You are helping a doctor articulate their approach to patient care.
Enhance the text to be warm, reassuring, and professional.
Focus on patient-centered language that builds trust.
Keep it genuine and not overly promotional.
Limit to 200 words.
Return only the enhanced text.`,

  first_visit: `You are helping a doctor write a helpful first visit guide for patients.
Make the content clear, informative, and reassuring for new patients.
Include practical information while maintaining a friendly tone.
Limit to 250 words.
Return only the enhanced text.`,

  conditions: `You are helping a doctor describe conditions they treat.
Organize and enhance the list of conditions to be clear and comprehensive.
Use proper medical terminology while keeping it accessible to patients.
Format as a comma-separated list of conditions.
Return only the enhanced list.`,

  procedures: `You are helping a doctor describe procedures they perform.
Enhance and organize the list of procedures professionally.
Use proper medical terminology while keeping it accessible.
Format as a comma-separated list of procedures.
Return only the enhanced list.`,
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = getAiLimiter();
    const rl = await checkRateLimit(limiter, userId);
    if (!rl.success) {
      return NextResponse.json(
        { error: `AI enhancement rate limit reached. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = enhanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const text = sanitizeBio(result.data.text);
    const { type, length } = result.data;

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI enhancement not configured. Please add OPENROUTER_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    // Try each model in order until one succeeds
    let lastError: string | null = null;

    for (const model of AI_MODELS) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://verified.doctor",
            "X-Title": "Verified.Doctor",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPTS[type] + LENGTH_INSTRUCTIONS[length],
              },
              {
                role: "user",
                content: `Please enhance the following text:\n\n${text}`,
              },
            ],
            max_tokens: LENGTH_TOKENS[length],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Model ${model} failed:`, errorData);
          lastError = errorData;
          continue; // Try next model
        }

        const data = await response.json();
        const enhancedText = data.choices?.[0]?.message?.content?.trim();

        if (!enhancedText) {
          console.error(`Model ${model} returned empty response`);
          lastError = "Empty response from model";
          continue; // Try next model
        }

        console.log(`Success with model: ${model}`);
        return NextResponse.json({ enhancedText });

      } catch (modelError) {
        console.error(`Model ${model} threw error:`, modelError);
        lastError = modelError instanceof Error ? modelError.message : "Unknown error";
        continue; // Try next model
      }
    }

    // All models failed
    console.error("All AI models failed. Last error:", lastError);
    return NextResponse.json(
      { error: "AI enhancement temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Enhance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
