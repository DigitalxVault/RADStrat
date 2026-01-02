/**
 * RSTA Server - OpenAI Token Minting Endpoint
 *
 * POST /api/token/openai
 *
 * Creates ephemeral tokens for OpenAI Realtime API access.
 * SECURITY: Never returns the actual API key to the client.
 */

import { Router, Request, Response } from "express";
import type { Router as RouterType } from "express";
import { httpPost } from "../utils/http.js";
import type {
  OpenAITokenRequest,
  OpenAITokenResponse,
  APIErrorResponse,
} from "@rsta/shared";

const router: RouterType = Router();

// OpenAI Realtime API client_secrets endpoint (GA version)
// Note: Migrated from /v1/realtime/sessions (beta) to /v1/realtime/client_secrets (GA)
const OPENAI_REALTIME_SESSION_URL = "https://api.openai.com/v1/realtime/client_secrets";

// Token expiry from environment or default to 5 minutes
const TOKEN_EXPIRY_SECONDS = parseInt(process.env.TOKEN_EXPIRY_SECONDS || "300", 10);

/**
 * Response shape from OpenAI's client_secrets endpoint (GA)
 * The new endpoint returns the token at top level, not nested in client_secret
 */
interface OpenAIClientSecretResponse {
  // Top-level value (new GA format)
  value?: string;
  expires_at?: number;

  // Session configuration echoed back
  id?: string;
  object?: string;
  model?: string;
  modalities?: string[];

  // Backward compatibility with old sessions endpoint format
  client_secret?: {
    value: string;
    expires_at: number;
  };
}

/**
 * POST /api/token/openai
 *
 * Creates an ephemeral session token for OpenAI Realtime API.
 * The client uses this token to connect directly to OpenAI's WebSocket.
 */
router.post("/", async (req: Request, res: Response) => {
  const requestBody = req.body as OpenAITokenRequest;
  const sessionId = requestBody.sessionId || "anonymous";

  // Validate API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[OpenAI Token] OPENAI_API_KEY not configured");
    const errorResponse: APIErrorResponse = {
      error: "OpenAI API key not configured",
      code: "PROVIDER_NOT_CONFIGURED",
    };
    return res.status(500).json(errorResponse);
  }

  // Validate API key format (basic sanity check)
  if (!apiKey.startsWith("sk-")) {
    console.error("[OpenAI Token] Invalid API key format");
    const errorResponse: APIErrorResponse = {
      error: "Invalid OpenAI API key configuration",
      code: "INVALID_CONFIGURATION",
    };
    return res.status(500).json(errorResponse);
  }

  try {
    console.log(`[OpenAI Token] Creating session for: ${sessionId}`);

    // Request ephemeral token from OpenAI's client_secrets endpoint (GA)
    // Note: The new endpoint requires session config wrapped in a 'session' object
    // with a different schema than the old /v1/realtime/sessions endpoint
    const response = await httpPost<OpenAIClientSecretResponse>(
      OPENAI_REALTIME_SESSION_URL,
      {
        // Token expiration configuration
        expires_after: {
          anchor: "created_at",
          seconds: TOKEN_EXPIRY_SECONDS,
        },
        // Session configuration (required)
        // Using minimal config - transcription settings can be applied later via WebSocket
        session: {
          type: "realtime",
          model: "gpt-4o-realtime-preview-2024-12-17",
          // Audio configuration with transcription enabled
          audio: {
            input: {
              transcription: {
                model: "whisper-1",
                language: "en",
              },
              // Disable server-side turn detection - we control when recording stops
              turn_detection: null,
            },
          },
        },
      },
      {
        Authorization: `Bearer ${apiKey}`,
      },
      15000 // 15 second timeout
    );

    if (!response.ok || !response.data) {
      console.error(`[OpenAI Token] Failed to create session: ${response.error}`);
      const errorResponse: APIErrorResponse = {
        error: response.error || "Failed to create OpenAI session",
        code: "PROVIDER_ERROR",
      };
      return res.status(502).json(errorResponse);
    }

    const sessionData = response.data;

    // Debug: Log full response structure
    console.log("[OpenAI Token] Response structure:", JSON.stringify(sessionData, null, 2));

    // Extract token value - handle both new (top-level) and old (nested) formats
    const tokenValue = sessionData.value || sessionData.client_secret?.value;
    const tokenExpiry = sessionData.expires_at || sessionData.client_secret?.expires_at;
    const modelName = sessionData.model || "gpt-4o-realtime-preview-2024-12-17";

    console.log(`[OpenAI Token] Extracted - token: ${tokenValue?.substring(0, 10)}..., model: ${modelName}`);

    // Validate response has required fields
    if (!tokenValue) {
      console.error("[OpenAI Token] Invalid response - missing token value", sessionData);
      const errorResponse: APIErrorResponse = {
        error: "Invalid response from OpenAI",
        code: "INVALID_PROVIDER_RESPONSE",
      };
      return res.status(502).json(errorResponse);
    }

    // Calculate expiry timestamp
    // Use OpenAI's expiry if provided, otherwise calculate from our config
    const expiresAt = tokenExpiry
      ? tokenExpiry * 1000 // Convert to milliseconds
      : Date.now() + TOKEN_EXPIRY_SECONDS * 1000;

    // Construct WebSocket URL for the Realtime API
    const websocketUrl = `wss://api.openai.com/v1/realtime?model=${modelName}`;

    const tokenResponse: OpenAITokenResponse = {
      token: tokenValue,
      expiresAt,
      websocketUrl,
    };

    console.log(`[OpenAI Token] Session created, expires at: ${new Date(expiresAt).toISOString()}`);

    return res.json(tokenResponse);
  } catch (error) {
    // Log error without sensitive details
    console.error(
      "[OpenAI Token] Unexpected error:",
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
