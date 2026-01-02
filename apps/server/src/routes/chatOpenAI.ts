/**
 * RSTA Server - OpenAI Chat API Proxy Endpoint
 *
 * POST /api/openai/chat
 *
 * Proxies requests to OpenAI Chat API for open-ended response scoring.
 * SECURITY: Keeps API key server-side, never exposed to client.
 */

import { Router, Request, Response } from "express";
import type { Router as RouterType } from "express";
import type { APIErrorResponse } from "@rsta/shared";

const router: RouterType = Router();

// OpenAI Chat API endpoint
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

// Default model for scoring
const DEFAULT_MODEL = "gpt-4o-mini";

// Timeout for API calls (ms)
const API_TIMEOUT_MS = 30000;

/**
 * Request body from client
 */
interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * OpenAI Chat API response
 */
interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * POST /api/openai/chat
 *
 * Proxies chat completion requests to OpenAI API.
 * Used for scoring open-ended responses.
 */
router.post("/", async (req: Request, res: Response) => {
  const requestBody = req.body as ChatRequest;

  // Validate request
  if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
    const errorResponse: APIErrorResponse = {
      error: "Invalid request: messages array is required",
      code: "INVALID_REQUEST",
    };
    return res.status(400).json(errorResponse);
  }

  if (requestBody.messages.length === 0) {
    const errorResponse: APIErrorResponse = {
      error: "Invalid request: messages array cannot be empty",
      code: "INVALID_REQUEST",
    };
    return res.status(400).json(errorResponse);
  }

  // Validate API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[OpenAI Chat] OPENAI_API_KEY not configured");
    const errorResponse: APIErrorResponse = {
      error: "OpenAI API key not configured",
      code: "PROVIDER_NOT_CONFIGURED",
    };
    return res.status(500).json(errorResponse);
  }

  // Validate API key format
  if (!apiKey.startsWith("sk-")) {
    console.error("[OpenAI Chat] Invalid API key format");
    const errorResponse: APIErrorResponse = {
      error: "Invalid OpenAI API key configuration",
      code: "INVALID_CONFIGURATION",
    };
    return res.status(500).json(errorResponse);
  }

  try {
    console.log(
      `[OpenAI Chat] Processing scoring request (${requestBody.messages.length} messages)`
    );

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // Call OpenAI Chat API
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: requestBody.model || DEFAULT_MODEL,
        messages: requestBody.messages,
        temperature: requestBody.temperature ?? 0.3, // Lower temperature for consistent scoring
        max_tokens: requestBody.max_tokens ?? 1000,
        response_format: { type: "json_object" }, // Force JSON response
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI Chat] API error: ${response.status} - ${errorText}`);

      let errorMessage = "OpenAI API error";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // Use default error message
      }

      const errorResponse: APIErrorResponse = {
        error: errorMessage,
        code: `OPENAI_${response.status}`,
      };
      return res.status(response.status >= 500 ? 502 : response.status).json(errorResponse);
    }

    const data = (await response.json()) as OpenAIChatResponse;

    // Log token usage for cost tracking
    if (data.usage) {
      console.log(
        `[OpenAI Chat] Tokens used: ${data.usage.total_tokens} ` +
          `(prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`
      );
    }

    // Return the response to client
    return res.json({
      choices: data.choices,
      usage: data.usage,
    });
  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[OpenAI Chat] Request timed out");
      const errorResponse: APIErrorResponse = {
        error: "OpenAI API request timed out",
        code: "TIMEOUT",
      };
      return res.status(504).json(errorResponse);
    }

    // Log error without sensitive details
    console.error(
      "[OpenAI Chat] Unexpected error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    const errorResponse: APIErrorResponse = {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
    return res.status(500).json(errorResponse);
  }
});

export default router;
