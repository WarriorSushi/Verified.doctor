import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { z } from "zod";
import { getAiLimiter, checkRateLimit, formatRetryAfter } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

const suggestSchema = z.object({
  specialty: z.string().min(1).max(200),
  existingTags: z.array(z.string()).default([]),
  type: z.enum(["conditions", "procedures"]),
});

// Models to try in order (primary + fallbacks)
const AI_MODELS = [
  "xiaomi/mimo-v2-flash:free",
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
];

// System prompts for different suggestion types
const SYSTEM_PROMPTS: Record<string, string> = {
  conditions: `You are a medical assistant helping doctors populate their profile with conditions they commonly treat.
Based on the doctor's specialty, suggest relevant medical conditions they would typically treat.
Return ONLY a JSON array of strings, nothing else. No markdown, no explanations.
Example output: ["Diabetes", "Hypertension", "Heart Disease"]
Suggest 10-15 relevant conditions.
Do NOT include conditions already provided by the user.
Use proper medical terminology that is also patient-friendly.`,

  procedures: `You are a medical assistant helping doctors populate their profile with procedures they commonly perform.
Based on the doctor's specialty, suggest relevant medical procedures they would typically perform.
Return ONLY a JSON array of strings, nothing else. No markdown, no explanations.
Example output: ["ECG", "Echocardiogram", "Stress Test"]
Suggest 10-15 relevant procedures.
Do NOT include procedures already provided by the user.
Use proper medical terminology that is also patient-friendly.`,
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
        { error: `AI suggestion rate limit reached. Try again in ${formatRetryAfter(rl.retryAfter || 60)}.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = suggestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.issues },
        { status: 400 }
      );
    }

    const specialty = sanitizeText(result.data.specialty);
    const existingTags = result.data.existingTags.map((tag) => sanitizeText(tag)).filter(Boolean);
    const { type } = result.data;

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI suggestions not configured. Please add OPENROUTER_API_KEY to environment variables." },
        { status: 503 }
      );
    }

    // Build user prompt
    const existingContext = existingTags.length > 0
      ? `\n\nAlready have these ${type}: ${existingTags.join(", ")}`
      : "";

    const userPrompt = `Specialty: ${specialty}${existingContext}\n\nSuggest relevant ${type} for this specialty.`;

    // Try each model in order until one succeeds
    let lastError: string | null = null;

    for (const model of AI_MODELS) {
      try {
        console.log(`[Suggest] Trying model: ${model}`);

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
                content: SYSTEM_PROMPTS[type],
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`[Suggest] Model ${model} failed:`, errorData);
          lastError = errorData;
          continue; // Try next model
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
          console.error(`[Suggest] Model ${model} returned empty response`);
          lastError = "Empty response from model";
          continue; // Try next model
        }

        // Parse the JSON array from the response
        let suggestions: string[] = [];
        try {
          // Try to extract JSON array from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            suggestions = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: split by commas or newlines
            suggestions = content
              .split(/[,\n]/)
              .map((s: string) => s.trim().replace(/^["'\-\d.\s]+|["']+$/g, ""))
              .filter((s: string) => s.length > 0 && s.length < 100);
          }
        } catch {
          console.error(`[Suggest] Failed to parse response:`, content);
          // Fallback parsing
          suggestions = content
            .split(/[,\n]/)
            .map((s: string) => s.trim().replace(/^["'\-\d.\s]+|["']+$/g, ""))
            .filter((s: string) => s.length > 0 && s.length < 100);
        }

        // Filter out any existing tags and limit to 15
        const filteredSuggestions = suggestions
          .filter((s: string) => !existingTags.some(
            (existing) => existing.toLowerCase() === s.toLowerCase()
          ))
          .slice(0, 15);

        if (filteredSuggestions.length === 0) {
          console.error(`[Suggest] Model ${model} returned no valid suggestions`);
          lastError = "No valid suggestions in response";
          continue; // Try next model
        }

        console.log(`[Suggest] Success with model: ${model}, got ${filteredSuggestions.length} suggestions`);
        return NextResponse.json({ suggestions: filteredSuggestions });

      } catch (modelError) {
        console.error(`[Suggest] Model ${model} threw error:`, modelError);
        lastError = modelError instanceof Error ? modelError.message : "Unknown error";
        continue; // Try next model
      }
    }

    // All models failed
    console.error("[Suggest] All AI models failed. Last error:", lastError);
    return NextResponse.json(
      { error: "AI suggestions temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  } catch (error) {
    console.error("[Suggest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
