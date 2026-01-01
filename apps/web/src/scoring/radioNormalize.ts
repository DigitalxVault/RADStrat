/**
 * Radio Transcript Normalization
 *
 * Normalizes STT output and expected responses for fair comparison.
 * Handles digit/word equivalence, callsign variants, and punctuation
 * while preserving meaning for safety-critical content.
 */

// ============================================================================
// NUMBER MAPPINGS
// ============================================================================

/** Single digit to word mapping */
const DIGIT_TO_WORD: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
};

/** Word to digit mapping (reverse) */
const WORD_TO_DIGIT: Record<string, string> = {
  'zero': '0',
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
  'niner': '9', // Aviation phonetic
};

/** Compound number words to separate digits */
const COMPOUND_NUMBERS: Record<string, string> = {
  'ten': 'one zero',
  'eleven': 'one one',
  'twelve': 'one two',
  'thirteen': 'one three',
  'fourteen': 'one four',
  'fifteen': 'one five',
  'sixteen': 'one six',
  'seventeen': 'one seven',
  'eighteen': 'one eight',
  'nineteen': 'one nine',
  'twenty': 'two zero',
  'thirty': 'three zero',
  'forty': 'four zero',
  'fifty': 'five zero',
  'sixty': 'six zero',
  'seventy': 'seven zero',
  'eighty': 'eight zero',
  'ninety': 'nine zero',
};

// ============================================================================
// CALLSIGN PREFIXES
// ============================================================================

/** Known callsign prefixes (words that precede a number in callsigns) */
const CALLSIGN_PREFIXES = [
  'bowser',
  'shepherd',
  'hotel',
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'india',
  'juliet',
  'kilo',
  'lima',
  'mike',
  'november',
  'oscar',
  'papa',
  'quebec',
  'romeo',
  'sierra',
  'tango',
  'uniform',
  'victor',
  'whiskey',
  'xray',
  'x-ray',
  'yankee',
  'zulu',
  'fire',
  'security',
  'afe',
  'contractor',
];

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Convert a multi-digit number string to spoken form (radio style)
 * e.g., "27" -> "two seven", "102" -> "one zero two"
 */
function digitsToSpoken(digits: string): string {
  return digits
    .split('')
    .map((d) => DIGIT_TO_WORD[d] || d)
    .join(' ');
}

/**
 * Convert compound number words to radio-style spoken digits
 * e.g., "twenty seven" -> "two seven"
 */
function expandCompoundNumbers(text: string): string {
  let result = text.toLowerCase();

  // Handle "twenty one" through "ninety nine"
  const tensPattern = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*(one|two|three|four|five|six|seven|eight|nine)?\b/gi;
  result = result.replace(tensPattern, (_match, tens, ones) => {
    const tensDigit = COMPOUND_NUMBERS[tens.toLowerCase()] || tens;
    if (ones) {
      const onesDigit = WORD_TO_DIGIT[ones.toLowerCase()] || ones;
      // Extract just the first digit of the tens (e.g., "two zero" -> "two")
      const tensFirst = tensDigit.split(' ')[0];
      return `${tensFirst} ${DIGIT_TO_WORD[onesDigit] || onesDigit}`;
    }
    return tensDigit;
  });

  // Handle standalone compound numbers (ten through nineteen)
  for (const [compound, spoken] of Object.entries(COMPOUND_NUMBERS)) {
    const pattern = new RegExp(`\\b${compound}\\b`, 'gi');
    result = result.replace(pattern, spoken);
  }

  return result;
}

/**
 * Normalize numbers in radio context to spoken form
 * Only normalizes numbers that appear in radio-relevant contexts
 */
function normalizeRadioNumbers(text: string): string {
  let result = text;

  // First expand any compound number words
  result = expandCompoundNumbers(result);

  // Normalize standalone number words to canonical form
  for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
    const pattern = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(pattern, DIGIT_TO_WORD[digit]);
  }

  // Convert digit sequences to spoken form
  // Match: callsign prefix + number, runway + number, etc.
  const callsignPrefixPattern = new RegExp(
    `\\b(${CALLSIGN_PREFIXES.join('|')})\\s*(\\d+)\\b`,
    'gi'
  );
  result = result.replace(callsignPrefixPattern, (_match, prefix, digits) => {
    return `${prefix} ${digitsToSpoken(digits)}`;
  });

  // Handle "runway XX" pattern
  result = result.replace(/\brunway\s*(\d+)\b/gi, (_match, digits) => {
    return `runway ${digitsToSpoken(digits)}`;
  });

  // Handle "taxiway X Y" or "taxiway XY" pattern
  result = result.replace(/\btaxiway\s*([a-z])\s*(\d+)\b/gi, (_match, letter, digits) => {
    return `taxiway ${letter} ${digitsToSpoken(digits)}`;
  });

  // Handle heading/altitude/squawk patterns
  result = result.replace(/\b(heading|altitude|squawk|flight level)\s*(\d+)\b/gi, (_match, type, digits) => {
    return `${type} ${digitsToSpoken(digits)}`;
  });

  return result;
}

/**
 * Remove punctuation that doesn't affect meaning
 */
function removePunctuation(text: string): string {
  return text
    .replace(/[.,;:!?'"]/g, ' ')  // Replace punctuation with space
    .replace(/\s+/g, ' ')          // Collapse multiple spaces
    .trim();
}

/**
 * Normalize common radio phrases
 */
function normalizeRadioPhrases(text: string): string {
  let result = text;

  // Normalize "over and out" variations
  result = result.replace(/\bover\s+and\s+out\b/gi, 'over and out');

  // Normalize "roger" variations
  result = result.replace(/\broger\s+that\b/gi, 'roger');

  // Normalize "copy" variations
  result = result.replace(/\bcopy\s+that\b/gi, 'copy');

  // Normalize receiver callsigns
  result = result.replace(/\bground\s+control\b/gi, 'ground');
  result = result.replace(/\batc\b/gi, 'atc');

  return result;
}

/**
 * Remove hyphens between words (normalize "seven-zero" to "seven zero")
 */
function normalizeHyphens(text: string): string {
  return text.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// ============================================================================
// MAIN NORMALIZATION FUNCTION
// ============================================================================

/**
 * Normalize a radio transcript for fair comparison
 *
 * @param text - The transcript or expected response to normalize
 * @returns Normalized text ready for comparison
 */
export function normalizeRadioTranscript(text: string): string {
  if (!text) return '';

  let result = text;

  // Step 1: Lowercase
  result = result.toLowerCase();

  // Step 2: Remove hyphens (before number processing)
  result = normalizeHyphens(result);

  // Step 3: Normalize numbers in radio context
  result = normalizeRadioNumbers(result);

  // Step 4: Normalize common radio phrases
  result = normalizeRadioPhrases(result);

  // Step 5: Remove punctuation
  result = removePunctuation(result);

  // Step 6: Final whitespace normalization
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Check if two radio transcripts are equivalent after normalization
 *
 * @param transcript1 - First transcript
 * @param transcript2 - Second transcript
 * @returns true if the transcripts are equivalent
 */
export function areTranscriptsEquivalent(
  transcript1: string,
  transcript2: string
): boolean {
  const normalized1 = normalizeRadioTranscript(transcript1);
  const normalized2 = normalizeRadioTranscript(transcript2);
  return normalized1 === normalized2;
}

/**
 * Get a detailed comparison of two transcripts
 *
 * @param expected - Expected response
 * @param actual - Actual transcript from STT
 * @returns Comparison result with normalization details
 */
export function compareTranscripts(
  expected: string,
  actual: string
): {
  normalizedExpected: string;
  normalizedActual: string;
  isEquivalent: boolean;
  differences: string[];
} {
  const normalizedExpected = normalizeRadioTranscript(expected);
  const normalizedActual = normalizeRadioTranscript(actual);
  const isEquivalent = normalizedExpected === normalizedActual;

  // Find token-level differences if not equivalent
  const differences: string[] = [];
  if (!isEquivalent) {
    const expectedTokens = normalizedExpected.split(' ');
    const actualTokens = normalizedActual.split(' ');

    // Simple diff: find tokens that don't match
    const maxLen = Math.max(expectedTokens.length, actualTokens.length);
    for (let i = 0; i < maxLen; i++) {
      const expToken = expectedTokens[i] || '[missing]';
      const actToken = actualTokens[i] || '[extra]';
      if (expToken !== actToken) {
        differences.push(`Position ${i + 1}: expected "${expToken}", got "${actToken}"`);
      }
    }
  }

  return {
    normalizedExpected,
    normalizedActual,
    isEquivalent,
    differences,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  normalizeRadioTranscript,
  areTranscriptsEquivalent,
  compareTranscripts,
};
