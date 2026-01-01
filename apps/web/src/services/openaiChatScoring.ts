/**
 * OpenAI Chat Scoring Service
 *
 * Handles scoring of open-ended responses using OpenAI Chat API.
 * Sends transcript + expected answer to OpenAI for evaluation.
 */

import type { OpenAIScoreResult, OpenAIScoreRequest, StructureMode } from "@rsta/shared";
import { getScoringSystemPrompt } from "../prompts/promptLoader";

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Server endpoint for Chat API proxy */
const CHAT_API_ENDPOINT = "/api/openai/chat";

/** Timeout for API calls (ms) */
const API_TIMEOUT_MS = 30000;

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

/**
 * Build the system prompt from markdown file
 * The prompt is loaded from apps/web/src/prompts/scoring.md
 * Edit that file to adjust scoring criteria, leniency rules, etc.
 */
function buildSystemPrompt(): string {
  return getScoringSystemPrompt();
}

/**
 * Build the user prompt with scenario details
 */
function buildUserPrompt(request: OpenAIScoreRequest): string {
  return `## EVALUATION REQUEST

### Scenario:
${request.scenarioPrompt}

### Structure Mode: ${formatStructureMode(request.structureMode)}

### Expected Response:
"${request.expectedAnswer}"

### Trainee's Actual Response:
"${request.transcript}"

Please evaluate the trainee's response and provide scores and feedback in the JSON format specified.`;
}

/**
 * Format structure mode for display
 */
function formatStructureMode(mode: StructureMode): string {
  switch (mode) {
    case "full":
      return "Full radio transmission (callsigns + message + closing)";
    case "ack_short":
      return "Short acknowledgment format";
    case "clarify_request":
      return "Clarification request format";
    default:
      return mode;
  }
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Call the server proxy to score with OpenAI Chat API
 */
async function callChatAPI(messages: ChatMessage[]): Promise<OpenAIScoreResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Chat API error: ${response.status} ${response.statusText}${
          errorData.error ? ` - ${errorData.error}` : ""
        }`
      );
    }

    const data: ChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from Chat API");
    }

    const content = data.choices[0].message.content;
    return parseScoreResponse(content);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Chat API request timed out");
    }

    throw error;
  }
}

/**
 * Parse the JSON response from OpenAI
 */
function parseScoreResponse(content: string): OpenAIScoreResult {
  // Try to extract JSON from the response (in case there's extra text)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    const result: OpenAIScoreResult = {
      accuracy: clampScore(parsed.accuracy ?? 0),
      fluency: clampScore(parsed.fluency ?? 0),
      structure: clampScore(parsed.structure ?? 0),
      overall: clampScore(parsed.overall ?? 0),
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
      fillerWords: Array.isArray(parsed.fillerWords)
        ? parsed.fillerWords.filter((w: unknown) => typeof w === "string")
        : [],
      fillerCount:
        typeof parsed.fillerCount === "number"
          ? Math.max(0, Math.round(parsed.fillerCount))
          : 0,
      radioProtocolNotes:
        typeof parsed.radioProtocolNotes === "string"
          ? parsed.radioProtocolNotes
          : undefined,
    };

    // Recalculate overall if needed
    if (result.overall === 0 && (result.accuracy > 0 || result.fluency > 0 || result.structure > 0)) {
      result.overall = Math.round(
        result.accuracy * 0.5 + result.fluency * 0.3 + result.structure * 0.2
      );
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse score response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Clamp a score to 0-100 range
 */
function clampScore(value: unknown): number {
  if (typeof value !== "number" || isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Score an open-ended response using OpenAI Chat API
 *
 * @param request - The score request with transcript, expected answer, and scenario
 * @returns Promise<OpenAIScoreResult> - The scoring result
 * @throws Error if API call fails or response is invalid
 */
export async function scoreWithOpenAI(
  request: OpenAIScoreRequest
): Promise<OpenAIScoreResult> {
  // Validate input
  if (!request.transcript || request.transcript.trim().length === 0) {
    return {
      accuracy: 0,
      fluency: 100, // No speech, no filler words
      structure: 0,
      overall: 15, // 0*0.5 + 100*0.3 + 0*0.2 = 30, but penalize for empty
      feedback: "No response was detected. Please speak your answer clearly.",
      fillerWords: [],
      fillerCount: 0,
      radioProtocolNotes: "No response provided.",
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(request) },
  ];

  return callChatAPI(messages);
}

/**
 * Get the current scoring prompt
 * Useful for debugging or displaying to user
 * The prompt is now loaded from apps/web/src/prompts/scoring.md
 */
export function getScoringPromptContent(): string {
  return getScoringSystemPrompt();
}

export default scoreWithOpenAI;
