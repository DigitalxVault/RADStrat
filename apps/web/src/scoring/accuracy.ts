/**
 * Accuracy Scoring
 *
 * Calculates accuracy score (0-100) based purely on text similarity.
 * This measures: Did the user say the right words?
 *
 * Formula: round(similarity * 100)
 *
 * Weight: 50% of overall score
 */

import type { AccuracyBreakdown } from "@rsta/shared";
import { normalizeRadioTranscript } from "./radioNormalize";
import { calculateSimilarity } from "./similarity";

/**
 * Calculates the accuracy score for a transcript
 * @param transcript - The actual spoken transcript
 * @param expected - The expected/reference answer
 * @returns Object containing score (0-100) and detailed breakdown
 */
export function calculateAccuracy(
  transcript: string,
  expected: string
): { score: number; breakdown: AccuracyBreakdown } {
  // Normalize both texts for radio-aware comparison
  // This handles digit/word equivalence (e.g., "27" = "two seven")
  // and callsign variants (e.g., "Bowser 1" = "Bowser One")
  const normalizedTranscript = normalizeRadioTranscript(transcript);
  const normalizedExpected = normalizeRadioTranscript(expected);

  // Calculate similarity (0-1)
  const similarityScore = calculateSimilarity(
    normalizedTranscript,
    normalizedExpected
  );

  // Convert to 0-100 score
  const score = Math.round(similarityScore * 100);

  return {
    score,
    breakdown: {
      similarityScore,
      normalizedTranscript,
      normalizedExpected,
    },
  };
}
