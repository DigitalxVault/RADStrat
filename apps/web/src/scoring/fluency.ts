/**
 * Fluency Scoring
 *
 * Calculates fluency score (0-100) based on filler word detection.
 * This measures: Did the user speak cleanly without fillers?
 *
 * Formula: 100 - min(50, totalFillers * 5)
 * - Each filler word costs 5 points
 * - Maximum penalty is 50 points (10+ filler words)
 *
 * Weight: 30% of overall score
 */

import type { FluencyBreakdown, FillerCount } from "@rsta/shared";
import { detectFillers, countTotalFillers } from "./fillers";

/**
 * Calculates the fluency score for a transcript
 * @param transcript - The actual spoken transcript
 * @returns Object containing score (0-100) and detailed breakdown
 */
export function calculateFluency(
  transcript: string
): { score: number; breakdown: FluencyBreakdown } {
  // Detect filler words in the transcript
  const fillers: FillerCount[] = detectFillers(transcript);
  const totalFillers = countTotalFillers(fillers);

  // Calculate filler penalty: min(50, fillerCount * 5)
  // Each filler word costs 5 points, capped at 50
  const fillerPenalty = Math.min(50, totalFillers * 5);

  // Calculate final score: 100 - penalty
  const score = 100 - fillerPenalty;

  return {
    score,
    breakdown: {
      fillerPenalty,
      fillers,
      totalFillers,
    },
  };
}
