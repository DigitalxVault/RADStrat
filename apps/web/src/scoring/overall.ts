/**
 * Overall Score Calculation
 *
 * Combines accuracy, fluency, and structure scores into a weighted overall score.
 *
 * Formula: round(0.50 * accuracy + 0.30 * fluency + 0.20 * structure)
 *
 * Weights (as per requirements):
 * - Accuracy: 50% (text similarity - did they say the right words?)
 * - Fluency: 30% (clean speech - no filler words)
 * - Structure: 20% (radio protocol adherence)
 */

// Scoring weights
const WEIGHTS = {
  accuracy: 0.50,
  fluency: 0.30,
  structure: 0.20,
} as const;

/**
 * Clamps a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the weighted overall score
 * @param accuracy - Accuracy score (0-100)
 * @param fluency - Fluency score (0-100)
 * @param structure - Structure score (0-100)
 * @returns Overall score (0-100), rounded to nearest integer
 */
export function calculateOverall(
  accuracy: number,
  fluency: number,
  structure: number
): number {
  // Ensure all inputs are within valid range
  const clampedAccuracy = clamp(accuracy, 0, 100);
  const clampedFluency = clamp(fluency, 0, 100);
  const clampedStructure = clamp(structure, 0, 100);

  // Calculate weighted sum
  const weighted =
    WEIGHTS.accuracy * clampedAccuracy +
    WEIGHTS.fluency * clampedFluency +
    WEIGHTS.structure * clampedStructure;

  // Round to nearest integer and clamp to 0-100
  return Math.round(clamp(weighted, 0, 100));
}

/**
 * Returns the current scoring weights
 */
export function getScoringWeights(): typeof WEIGHTS {
  return WEIGHTS;
}
