/**
 * Radio Transcript Normalization Tests
 *
 * Tests for the radioNormalize utility that handles digit/word equivalence,
 * callsign normalization, and punctuation handling for fair STT comparison.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeRadioTranscript,
  areTranscriptsEquivalent,
  compareTranscripts,
} from './radioNormalize';

// ============================================================================
// BASIC NORMALIZATION TESTS
// ============================================================================

describe('normalizeRadioTranscript', () => {
  it('should lowercase text', () => {
    expect(normalizeRadioTranscript('ATC')).toBe('atc');
    expect(normalizeRadioTranscript('Bowser One')).toBe('bowser one');
  });

  it('should remove punctuation', () => {
    expect(normalizeRadioTranscript('ATC, hello.')).toBe('atc hello');
    // Apostrophes are replaced with space, then collapsed
    expect(normalizeRadioTranscript("It's working!")).toBe('it s working');
  });

  it('should normalize whitespace', () => {
    expect(normalizeRadioTranscript('hello   world')).toBe('hello world');
    expect(normalizeRadioTranscript('  leading and trailing  ')).toBe('leading and trailing');
  });

  it('should normalize hyphens', () => {
    expect(normalizeRadioTranscript('seven-zero')).toBe('seven zero');
    expect(normalizeRadioTranscript('x-ray')).toBe('x ray');
  });
});

// ============================================================================
// DIGIT-TO-WORD NORMALIZATION TESTS
// ============================================================================

describe('digit-to-word normalization', () => {
  it('should convert callsign numbers to words', () => {
    expect(normalizeRadioTranscript('Bowser 1')).toBe('bowser one');
    expect(normalizeRadioTranscript('Hotel 70')).toBe('hotel seven zero');
    expect(normalizeRadioTranscript('Echo 6')).toBe('echo six');
  });

  it('should convert runway numbers to words', () => {
    expect(normalizeRadioTranscript('runway 27')).toBe('runway two seven');
    expect(normalizeRadioTranscript('runway 09')).toBe('runway zero nine');
  });

  it('should handle taxiway patterns', () => {
    // Phonetic letters are preserved, only numbers are converted
    expect(normalizeRadioTranscript('taxiway Alpha 3')).toBe('taxiway alpha three');
  });

  it('should handle heading/altitude/squawk', () => {
    expect(normalizeRadioTranscript('heading 270')).toBe('heading two seven zero');
    expect(normalizeRadioTranscript('altitude 5000')).toBe('altitude five zero zero zero');
    expect(normalizeRadioTranscript('squawk 1234')).toBe('squawk one two three four');
  });

  it('should normalize word-based numbers to canonical form', () => {
    expect(normalizeRadioTranscript('niner')).toBe('nine');
    expect(normalizeRadioTranscript('Bowser niner')).toBe('bowser nine');
  });
});

// ============================================================================
// COMPOUND NUMBER TESTS
// ============================================================================

describe('compound number normalization', () => {
  it('should expand compound numbers (ten through nineteen)', () => {
    expect(normalizeRadioTranscript('ten')).toBe('one zero');
    expect(normalizeRadioTranscript('eleven')).toBe('one one');
    expect(normalizeRadioTranscript('fifteen')).toBe('one five');
    expect(normalizeRadioTranscript('nineteen')).toBe('one nine');
  });

  it('should expand decade numbers', () => {
    expect(normalizeRadioTranscript('twenty')).toBe('two zero');
    expect(normalizeRadioTranscript('thirty')).toBe('three zero');
    expect(normalizeRadioTranscript('ninety')).toBe('nine zero');
  });

  it('should expand compound two-digit numbers', () => {
    expect(normalizeRadioTranscript('twenty seven')).toBe('two seven');
    expect(normalizeRadioTranscript('thirty five')).toBe('three five');
    expect(normalizeRadioTranscript('forty two')).toBe('four two');
  });

  it('should handle runway with compound numbers', () => {
    expect(normalizeRadioTranscript('runway twenty seven')).toBe('runway two seven');
  });
});

// ============================================================================
// RADIO PHRASE NORMALIZATION TESTS
// ============================================================================

describe('radio phrase normalization', () => {
  it('should normalize roger variations', () => {
    expect(normalizeRadioTranscript('roger that')).toBe('roger');
    expect(normalizeRadioTranscript('Roger That')).toBe('roger');
  });

  it('should normalize copy variations', () => {
    expect(normalizeRadioTranscript('copy that')).toBe('copy');
  });

  it('should normalize ground control', () => {
    expect(normalizeRadioTranscript('ground control')).toBe('ground');
  });
});

// ============================================================================
// EQUIVALENCE TESTS (KEY USER SCENARIOS)
// ============================================================================

describe('areTranscriptsEquivalent', () => {
  it('should treat digit and word forms as equivalent', () => {
    expect(areTranscriptsEquivalent(
      'Bowser 1',
      'Bowser One'
    )).toBe(true);

    expect(areTranscriptsEquivalent(
      'Hotel 70',
      'Hotel seven zero'
    )).toBe(true);

    expect(areTranscriptsEquivalent(
      'runway 27',
      'runway two seven'
    )).toBe(true);
  });

  it('should treat compound numbers as equivalent to radio style', () => {
    expect(areTranscriptsEquivalent(
      'runway twenty seven',
      'runway two seven'
    )).toBe(true);
  });

  it('should ignore case differences', () => {
    expect(areTranscriptsEquivalent(
      'ATC Bowser One',
      'atc bowser one'
    )).toBe(true);
  });

  it('should ignore punctuation differences', () => {
    expect(areTranscriptsEquivalent(
      'ATC, Bowser One, over.',
      'ATC Bowser One over'
    )).toBe(true);
  });

  it('should NOT treat different numbers as equivalent', () => {
    expect(areTranscriptsEquivalent(
      'runway 27',
      'runway 25'
    )).toBe(false);

    expect(areTranscriptsEquivalent(
      'Bowser One',
      'Bowser Two'
    )).toBe(false);
  });

  it('should NOT treat missing content as equivalent', () => {
    expect(areTranscriptsEquivalent(
      'ATC Bowser One request taxi',
      'ATC Bowser One taxi'
    )).toBe(false);
  });
});

// ============================================================================
// FULL SCENARIO TESTS
// ============================================================================

describe('full radio transmission scenarios', () => {
  it('should match complete transmission with digit variants', () => {
    const expected = 'ATC, Bowser One, request permission to taxi to runway two seven, over.';
    const actual = 'ATC Bowser 1, request permission to taxi to runway 27, over';

    expect(areTranscriptsEquivalent(expected, actual)).toBe(true);
  });

  it('should detect wrong runway number', () => {
    const expected = 'ATC, Bowser One, request permission to taxi to runway two seven, over.';
    const actual = 'ATC Bowser 1, request permission to taxi to runway 25, over';

    expect(areTranscriptsEquivalent(expected, actual)).toBe(false);
  });

  it('should detect wrong callsign', () => {
    const expected = 'ATC, Bowser One, over.';
    const actual = 'ATC, Bowser Two, over.';

    expect(areTranscriptsEquivalent(expected, actual)).toBe(false);
  });
});

// ============================================================================
// COMPARE TRANSCRIPTS TESTS
// ============================================================================

describe('compareTranscripts', () => {
  it('should return detailed comparison for equivalent texts', () => {
    const result = compareTranscripts(
      'runway two seven',
      'runway 27'
    );

    expect(result.isEquivalent).toBe(true);
    expect(result.normalizedExpected).toBe('runway two seven');
    expect(result.normalizedActual).toBe('runway two seven');
    expect(result.differences).toHaveLength(0);
  });

  it('should return differences for non-equivalent texts', () => {
    const result = compareTranscripts(
      'runway two seven',
      'runway two five'
    );

    expect(result.isEquivalent).toBe(false);
    expect(result.differences.length).toBeGreaterThan(0);
  });
});
