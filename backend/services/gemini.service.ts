import { GoogleGenAI } from "@google/genai";
import { env } from "../config/envConfig";
import { ApiError } from "../utils/ApiError";

// Cached singleton instance of the Google Gen AI client
let client: GoogleGenAI | null = null;

// Lazily initializes and returns the GenAI client if the API key is configured
const getClient = (): GoogleGenAI => {
  if (!env.gemini.apiKey) {
    throw ApiError.badRequest(
      "AI is not configured. Set GEMINI_API_KEY in the backend .env to enable AI features.",
    );
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  }

  return client;
};

// Strips Markdown code blocks and extracts the raw JSON payload before parsing
const parseJson = (raw?: string): any => {
  if (!raw) {
    throw ApiError.internal("AI returned an empty response");
  }

  let cleaned = raw.trim();

  // Strips surrounding markdown code block syntax if present
  cleaned = cleaned
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  // Locates the bounding braces or brackets to isolate the core JSON structure
  const firstBrace = cleaned.search(/[{\[]/);
  const lastBrace = Math.max(
    cleaned.lastIndexOf("}"),
    cleaned.lastIndexOf("]"),
  );

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw ApiError.internal("AI returned malformed JSON. Please try again.");
  }
};

// Generates structured JSON output from Gemini based on a prompt and schema hint
export const generateJson = async (
  prompt: string,
  { schemaHint = "" }: { schemaHint?: string } = {},
): Promise<any> => {
  const ai = getClient();

  // Appends strict JSON output instructions and optional schema definitions
  const fullPrompt = `${prompt}

${
  schemaHint
    ? `Return ONLY valid minified JSON matching this shape:\n${schemaHint}`
    : ""
}
Do not include markdown code fences or any prose. Output JSON only.`;

  let text: string | undefined;
  try {
    const result = await ai.models.generateContent({
      model: env.gemini.model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    text = result.text;
  } catch (err: any) {
    throw ApiError.internal(`AI request failed: ${err.message}`);
  }

  return parseJson(text);
};

// Generates plain text completions from Gemini without JSON formatting constraints
export const generateText = async (prompt: string): Promise<string> => {
  const ai = getClient();

  try {
    const result = await ai.models.generateContent({
      model: env.gemini.model,
      contents: prompt,
      config: { temperature: 0.7 },
    });

    return result.text?.trim() || "";
  } catch (err: any) {
    throw ApiError.internal(`AI request failed: ${err.message}`);
  }
};
