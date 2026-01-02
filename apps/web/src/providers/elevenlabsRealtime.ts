/**
 * ElevenLabs Realtime STT Provider Adapter
 *
 * Implements real-time speech-to-text using ElevenLabs Scribe WebSocket API.
 * Audio must be sent as JSON with base64-encoded PCM data.
 *
 * Protocol Reference (Context7):
 * - Audio: JSON with message_type, audio_base_64, commit, sample_rate
 * - Events: session_started, partial_transcript, committed_transcript, etc.
 */

import { BaseProviderAdapter } from './base';
import type { WordTiming } from './types';

// ============================================================================
// ELEVENLABS SCRIBE API TYPES
// ============================================================================

/** Audio input chunk message */
interface ElevenLabsAudioChunk {
  message_type: 'input_audio_chunk';
  audio_base_64: string;
  commit: boolean;
  sample_rate: number;
}

/** Session started event - NOTE: ElevenLabs uses message_type not type */
interface ElevenLabsSessionStarted {
  message_type: 'session_started';
  session_id?: string;
}

/** Partial transcript event (interim) */
interface ElevenLabsPartialTranscript {
  message_type: 'partial_transcript';
  text: string;
}

/** Committed transcript event (final) */
interface ElevenLabsCommittedTranscript {
  message_type: 'committed_transcript';
  text: string;
}

/** Committed transcript with timestamps */
interface ElevenLabsCommittedTranscriptWithTimestamps {
  message_type: 'committed_transcript_with_timestamps';
  text: string;
  words?: ElevenLabsWordInfo[];
}

/** ElevenLabs word information */
interface ElevenLabsWordInfo {
  word: string;
  start: number; // seconds
  end: number; // seconds
  confidence?: number;
}

/** Error events - ElevenLabs error types */
interface ElevenLabsErrorEvent {
  message_type:
    | 'scribeError'
    | 'scribeAuthError'
    | 'scribeQuotaExceededError'
    | 'scribeThrottledError'
    | 'scribeRateLimitedError'
    | 'scribeInputError'
    | 'input_error';
  code?: string;
  message?: string;
  error?: string;
}

/** Union of all ElevenLabs events */
type ElevenLabsEvent =
  | ElevenLabsSessionStarted
  | ElevenLabsPartialTranscript
  | ElevenLabsCommittedTranscript
  | ElevenLabsCommittedTranscriptWithTimestamps
  | ElevenLabsErrorEvent;

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Default sample rate for ElevenLabs Scribe */
const DEFAULT_SAMPLE_RATE = 16000;

// ============================================================================
// ELEVENLABS REALTIME ADAPTER
// ============================================================================

/**
 * ElevenLabs Realtime Speech-to-Text Adapter
 *
 * Connects to ElevenLabs Scribe WebSocket API for real-time transcription.
 * Uses JSON messages with base64-encoded PCM audio.
 */
export class ElevenLabsRealtimeAdapter extends BaseProviderAdapter {
  readonly providerId = 'elevenlabs' as const;

  /** Sample rate for audio */
  private sampleRate: number = DEFAULT_SAMPLE_RATE;

  /** Track if session is ready */
  private sessionStarted: boolean = false;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Set the sample rate for audio
   */
  setSampleRate(rate: number): void {
    this.sampleRate = rate;
    this.log('Sample rate set', rate);
  }

  /**
   * Check if the ElevenLabs session is fully ready
   */
  isSessionReady(): boolean {
    return this.sessionStarted && this.isConnected();
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  /**
   * Handle incoming WebSocket messages from ElevenLabs Scribe API
   */
  protected handleMessage(data: string | ArrayBuffer): void {
    // ElevenLabs sends JSON text messages
    if (typeof data !== 'string') {
      this.log('Received unexpected binary data');
      return;
    }

    try {
      const event = JSON.parse(data) as ElevenLabsEvent;
      this.log('Received event', event.message_type);

      switch (event.message_type) {
        case 'session_started':
          this.handleSessionStarted(event);
          break;

        case 'partial_transcript':
          this.handlePartialTranscript(event);
          break;

        case 'committed_transcript':
          this.handleCommittedTranscript(event);
          break;

        case 'committed_transcript_with_timestamps':
          this.handleCommittedTranscriptWithTimestamps(event);
          break;

        case 'scribeError':
        case 'scribeAuthError':
        case 'scribeQuotaExceededError':
        case 'scribeThrottledError':
        case 'scribeRateLimitedError':
        case 'scribeInputError':
        case 'input_error':
          this.handleErrorEvent(event);
          break;

        default:
          this.log('Unknown event type', (event as { message_type: string }).message_type);
      }
    } catch (error) {
      this.log('Failed to parse message', error);
      this.addError('Failed to parse ElevenLabs message');
    }
  }

  /**
   * Create the initial configuration message
   *
   * ElevenLabs Scribe API doesn't require a configuration message -
   * the token URL includes all necessary configuration.
   */
  protected createConfigurationMessage(): string | null {
    // No configuration message needed - token URL handles config
    this.log('ElevenLabs Scribe: No configuration message needed');
    return null;
  }

  /**
   * Format audio data for sending to ElevenLabs Scribe API
   *
   * CRITICAL: ElevenLabs requires JSON with base64-encoded audio,
   * NOT raw binary data.
   */
  protected formatAudioForSending(chunk: ArrayBuffer): string {
    // Convert ArrayBuffer to base64 string
    const uint8Array = new Uint8Array(chunk);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    // Create the JSON message per ElevenLabs Scribe protocol
    const message: ElevenLabsAudioChunk = {
      message_type: 'input_audio_chunk',
      audio_base_64: base64Audio,
      commit: false,
      sample_rate: this.sampleRate,
    };

    return JSON.stringify(message);
  }

  /**
   * Create the end-of-audio signal message
   *
   * Sends a commit message to finalize transcription.
   */
  protected createEndAudioMessage(): string | null {
    // Send a final commit message to signal end of audio
    const message: ElevenLabsAudioChunk = {
      message_type: 'input_audio_chunk',
      audio_base_64: '', // Empty audio
      commit: true,      // Commit to trigger final transcription
      sample_rate: this.sampleRate,
    };

    this.log('Sending commit message to finalize transcription');
    return JSON.stringify(message);
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle session_started event - confirms connection is ready
   */
  private handleSessionStarted(event: ElevenLabsSessionStarted): void {
    this.sessionStarted = true;
    this.log('Session started', event.session_id);

    this.emit('connection_state_change', {
      type: 'connection_state_change',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        previousState: 'connecting',
        currentState: 'connected',
        reason: 'Session started',
      },
    });
  }

  /**
   * Handle partial_transcript event - interim/real-time transcription
   */
  private handlePartialTranscript(event: ElevenLabsPartialTranscript): void {
    const { text } = event;

    // Update interim text
    this.updateTranscript({
      interimText: text,
      isFinal: false,
    });

    this.emit('transcript_interim', {
      type: 'transcript_interim',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        text: text,
        isFinal: false,
        state: this.getTranscriptState(),
      },
    });
  }

  /**
   * Handle committed_transcript event - finalized text
   */
  private handleCommittedTranscript(event: ElevenLabsCommittedTranscript): void {
    const { text } = event;

    // Commit the text
    this.updateTranscript({
      committedText: this.transcript.committedText + text + ' ',
      interimText: '',
      finalText: text,
      isFinal: true,
    });

    this.emit('transcript_committed', {
      type: 'transcript_committed',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        text: text,
        isFinal: true,
        state: this.getTranscriptState(),
      },
    });

    this.emit('transcript_final', {
      type: 'transcript_final',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        text: this.transcript.committedText.trim(),
        isFinal: true,
        state: this.getTranscriptState(),
      },
    });

    // Update status to completed
    this._status = 'completed';
    this.completedAt = Date.now();
  }

  /**
   * Handle committed_transcript_with_timestamps - text with word timings
   */
  private handleCommittedTranscriptWithTimestamps(event: ElevenLabsCommittedTranscriptWithTimestamps): void {
    const { text, words } = event;

    // Process word timings if available
    if (words && words.length > 0) {
      this.processWordTimings(words);
    }

    // Commit the text
    this.updateTranscript({
      committedText: this.transcript.committedText + text + ' ',
      interimText: '',
      finalText: text,
      isFinal: true,
    });

    this.emit('transcript_committed', {
      type: 'transcript_committed',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        text: text,
        isFinal: true,
        state: this.getTranscriptState(),
      },
    });

    this.emit('transcript_final', {
      type: 'transcript_final',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        text: this.transcript.committedText.trim(),
        isFinal: true,
        state: this.getTranscriptState(),
      },
    });

    // Update status to completed
    this._status = 'completed';
    this.completedAt = Date.now();
  }

  /**
   * Handle error events from ElevenLabs Scribe API
   */
  private handleErrorEvent(event: ElevenLabsErrorEvent): void {
    const errorMessage = event.message || event.error || 'Unknown ElevenLabs error';
    const errorCode = event.code || event.message_type || 'ELEVENLABS_ERROR';

    this.addError(errorMessage);
    this._status = 'error';

    this.emit('error', {
      type: 'error',
      providerId: this.providerId,
      timestamp: Date.now(),
      data: {
        code: errorCode,
        message: errorMessage,
        recoverable: this.isRecoverableError(errorCode),
        details: event,
      },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Process word timing information from transcript event
   */
  private processWordTimings(words: ElevenLabsWordInfo[]): void {
    for (const wordInfo of words) {
      const wordTiming: WordTiming = {
        word: wordInfo.word,
        startMs: Math.round(wordInfo.start * 1000),
        endMs: Math.round(wordInfo.end * 1000),
        confidence: wordInfo.confidence,
      };

      // Only add if not already tracked (avoid duplicates)
      const exists = this.wordTimings.some(
        (w) =>
          w.word === wordTiming.word &&
          w.startMs === wordTiming.startMs &&
          w.endMs === wordTiming.endMs
      );

      if (!exists) {
        this.addWordTiming(wordTiming);

        this.emit('word_timing', {
          type: 'word_timing',
          providerId: this.providerId,
          timestamp: Date.now(),
          data: {
            word: wordTiming.word,
            startMs: wordTiming.startMs,
            endMs: wordTiming.endMs,
            confidence: wordTiming.confidence,
          },
        });
      }
    }
  }

  /**
   * Determine if an error is recoverable
   */
  private isRecoverableError(code: string): boolean {
    const recoverableCodes = [
      'RATE_LIMIT',
      'TEMPORARY_ERROR',
      'TIMEOUT',
      'CONNECTION_LOST',
    ];
    return recoverableCodes.some((c) => code.toUpperCase().includes(c));
  }

  // ============================================================================
  // OVERRIDE: Reset
  // ============================================================================

  /**
   * Reset adapter state including ElevenLabs-specific state
   */
  reset(): void {
    super.reset();
    this.sessionStarted = false;
  }

  /**
   * Reset for new recording without disconnecting WebSocket.
   * Clears transcript state but keeps session and connection alive.
   * Used by connection pool to prepare for next recording.
   */
  override resetForNewRecording(): void {
    super.resetForNewRecording();

    // Keep sessionStarted - we're reusing the session
    // The WebSocket connection and session remain active

    this.log('Reset for new recording (keeping session)', { sessionReady: this.sessionStarted });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new ElevenLabs realtime adapter instance
 */
export function createElevenLabsAdapter(): ElevenLabsRealtimeAdapter {
  return new ElevenLabsRealtimeAdapter();
}
