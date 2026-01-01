/**
 * Prompt Loader Utility
 *
 * Loads markdown prompts from the prompts directory and parses them
 * for use in LLM API calls. This allows prompt changes without code modifications.
 */

// Import markdown files as raw text
import scoringPromptRaw from './scoring.md?raw';

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedScoringPrompt {
  /** Full system prompt for the LLM */
  systemPrompt: string;
  /** Extracted leniency rules section */
  leniencyRules: string;
  /** Extracted output format section */
  outputFormat: string;
}

// ============================================================================
// PROMPT PARSING
// ============================================================================

/**
 * Extract a section from markdown by heading
 */
function extractSection(markdown: string, heading: string): string {
  const headingPattern = new RegExp(`^##+ ${heading}[\\s\\S]*?(?=^##|$)`, 'gim');
  const match = markdown.match(headingPattern);
  return match ? match[0].trim() : '';
}

/**
 * Parse the scoring prompt markdown into structured parts
 */
export function parseScoringPrompt(): ParsedScoringPrompt {
  return {
    systemPrompt: scoringPromptRaw,
    leniencyRules: extractSection(scoringPromptRaw, 'Leniency Rules'),
    outputFormat: extractSection(scoringPromptRaw, 'Output Format'),
  };
}

/**
 * Get the full system prompt for OpenAI scoring
 */
export function getScoringSystemPrompt(): string {
  return scoringPromptRaw;
}

/**
 * Build a user prompt for evaluating a transcript
 */
export function buildScoringUserPrompt(
  expectedResponse: string,
  actualTranscript: string,
  context?: string
): string {
  let prompt = `## Evaluation Request

**Expected Response:**
"${expectedResponse}"

**Actual Transcript (from STT):**
"${actualTranscript}"
`;

  if (context) {
    prompt += `
**Context:**
${context}
`;
  }

  prompt += `
Please evaluate the transcript against the expected response using the scoring criteria and leniency rules from your instructions. Return your evaluation as a JSON object.
`;

  return prompt;
}

// ============================================================================
// FILLER WORDS (extracted for reuse)
// ============================================================================

/**
 * List of filler words to detect in transcripts
 * Kept in sync with scoring.md
 */
export const FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'so',
  'well',
  'right',
  'okay',
  'i mean',
];

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getScoringSystemPrompt,
  buildScoringUserPrompt,
  parseScoringPrompt,
  FILLER_WORDS,
};
