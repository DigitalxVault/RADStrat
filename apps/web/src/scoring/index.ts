/**
 * RSTA Scoring Engine
 *
 * Re-exports all scoring functions for convenient import.
 *
 * Scoring Model:
 * - Accuracy (50%): Pure text similarity
 * - Fluency (30%): Clean speech without fillers
 * - Structure (20%): Radio protocol adherence
 *
 * Usage:
 *   import { calculateAccuracy, calculateFluency, calculateStructure, calculateOverall } from '@/scoring';
 *   // or
 *   import * as scoring from '@/scoring';
 */

// Text normalization
export { normalizeText } from "./normalize";

// Similarity calculation
export { calculateSimilarity } from "./similarity";

// Filler word detection
export { detectFillers, countTotalFillers } from "./fillers";

// Accuracy scoring (50% weight)
export { calculateAccuracy } from "./accuracy";

// Fluency scoring (30% weight)
export { calculateFluency } from "./fluency";

// Structure scoring (20% weight)
export { calculateStructure } from "./structure";

// Overall score calculation
export { calculateOverall, getScoringWeights } from "./overall";
