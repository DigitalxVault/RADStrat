/**
 * Dual STT Recording Hook
 *
 * Manages simultaneous recording to OpenAI and ElevenLabs STT providers.
 * Uses PRE-CONNECTED WebSocket adapters from the connection pool for
 * zero-delay speech capture when TALK button is pressed.
 *
 * Connection Lifecycle:
 * 1. Connection pool pre-establishes WebSocket connections when question loads
 * 2. TALK button only needs: mic permission (~50ms) + chunker start (~10ms)
 * 3. Audio starts flowing immediately - no connection delay!
 */

import { useCallback, useRef, useEffect } from 'react';
import { useSessionStore, type ProviderId } from '../state/sessionStore';
import { useConnectionPoolStore } from '../state/connectionPoolStore';
import { requestMicPermission, stopMicStream } from '../audio/mic';
import { createAudioChunker, type AudioChunker } from '../audio/chunker';
import type { BaseProviderAdapter } from '../providers/base';
import { OpenAIRealtimeAdapter } from '../providers/openaiRealtime';
import { ElevenLabsRealtimeAdapter } from '../providers/elevenlabsRealtime';
import appConfig from '../data/app_config.json';

// API endpoints for fallback on-demand connections
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const OPENAI_TOKEN_URL = `${API_BASE_URL}/api/token/openai`;
const ELEVENLABS_TOKEN_URL = `${API_BASE_URL}/api/token/elevenlabs`;

// ============================================================================
// Types
// ============================================================================

interface DualSTTHookReturn {
  /** Start recording and streaming to both providers */
  startRecording: () => Promise<void>;
  /** Stop recording and finalize both providers */
  stopRecording: () => void;
  /** Whether recording is currently active */
  isRecording: boolean;
  /** Whether connection pool is ready */
  isPoolReady: boolean;
  /** Whether connection pool is initializing */
  isPoolInitializing: boolean;
  /** Any errors that occurred */
  error: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDualSTT(): DualSTTHookReturn {
  // Store actions
  const {
    recordingState,
    startRecording: storeStartRecording,
    stopRecording: storeStopRecording,
    updateProviderStatus,
    updateProviderTranscript,
    updateProviderWords,
    updateProviderDuration,
    setProviderError,
    computeScores,
    setRecordingCompleted,
  } = useSessionStore();

  // Connection pool state
  const poolIsReady = useConnectionPoolStore((state) => state.isReady);
  const poolIsInitializing = useConnectionPoolStore((state) => state.isInitializing);
  const poolError = useConnectionPoolStore((state) => state.error);
  const getAdapter = useConnectionPoolStore((state) => state.getAdapter);
  const resetAdaptersForNewRecording = useConnectionPoolStore(
    (state) => state.resetAdaptersForNewRecording
  );

  // Refs for cleanup
  const audioChunkerRef = useRef<AudioChunker | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const errorRef = useRef<string | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  // Recording cycle ID to track which recording session a timeout belongs to
  const recordingCycleRef = useRef<number>(0);
  // Event listener cleanup functions
  const eventCleanupRef = useRef<(() => void)[]>([]);
  // Fallback adapters for on-demand connection (when pool isn't ready)
  const fallbackOpenAIRef = useRef<BaseProviderAdapter | null>(null);
  const fallbackElevenLabsRef = useRef<BaseProviderAdapter | null>(null);
  // Track if we're using fallback adapters
  const usingFallbackRef = useRef<boolean>(false);

  // Helper to set up event listeners for a provider
  const setupProviderEvents = useCallback((
    adapter: BaseProviderAdapter,
    providerId: ProviderId
  ): (() => void)[] => {
    const cleanupFns: (() => void)[] = [];

    // Connection state changes
    cleanupFns.push(adapter.on('connection_state_change', (event) => {
      const { currentState } = event.data;

      if (currentState === 'connected') {
        updateProviderStatus(providerId, 'listening');
      } else if (currentState === 'error') {
        updateProviderStatus(providerId, 'error');
      } else if (currentState === 'disconnected' || currentState === 'closed') {
        const result = useSessionStore.getState()[
          providerId === 'openai' ? 'openaiResult' : 'elevenlabsResult'
        ];
        if (result.status === 'listening' || result.status === 'processing') {
          updateProviderStatus(providerId, 'error');
        }
      }
    }));

    // Interim transcript updates
    cleanupFns.push(adapter.on('transcript_interim', (event) => {
      updateProviderTranscript(providerId, {
        interimText: event.data.text,
      });
    }));

    // Committed transcript updates
    cleanupFns.push(adapter.on('transcript_committed', (event) => {
      updateProviderTranscript(providerId, {
        committedText: event.data.text,
      });
    }));

    // Final transcript
    cleanupFns.push(adapter.on('transcript_final', (event) => {
      const duration = Date.now() - recordingStartTimeRef.current;

      updateProviderTranscript(providerId, {
        finalText: event.data.text,
      });
      updateProviderDuration(providerId, duration);
      updateProviderStatus(providerId, 'processing');

      // Get word timings if available
      const words = adapter.getWordTimings();
      if (words.length > 0) {
        updateProviderWords(providerId, words);
      }

      // Compute scores
      computeScores(providerId);
    }));

    // Word timing events
    cleanupFns.push(adapter.on('word_timing', () => {
      const currentWords = adapter.getWordTimings();
      updateProviderWords(providerId, currentWords);
    }));

    // Error events
    cleanupFns.push(adapter.on('error', (event) => {
      setProviderError(providerId, event.data.message);
    }));

    return cleanupFns;
  }, [
    updateProviderStatus,
    updateProviderTranscript,
    updateProviderWords,
    updateProviderDuration,
    setProviderError,
    computeScores,
  ]);

  // Clean up event listeners
  const cleanupEventListeners = useCallback(() => {
    eventCleanupRef.current.forEach(cleanup => cleanup());
    eventCleanupRef.current = [];
  }, []);

  // Cleanup function for audio resources
  const cleanup = useCallback(() => {
    // Clean up event listeners
    cleanupEventListeners();

    // Stop audio chunker
    if (audioChunkerRef.current) {
      audioChunkerRef.current.stop();
      audioChunkerRef.current = null;
    }

    // Stop microphone
    if (mediaStreamRef.current) {
      stopMicStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    }

    // Clean up fallback adapters if we created them
    if (usingFallbackRef.current) {
      if (fallbackOpenAIRef.current) {
        try {
          fallbackOpenAIRef.current.disconnect();
        } catch (e) {
          console.error('[useDualSTT] Error disconnecting fallback OpenAI adapter:', e);
        }
        fallbackOpenAIRef.current = null;
      }
      if (fallbackElevenLabsRef.current) {
        try {
          fallbackElevenLabsRef.current.disconnect();
        } catch (e) {
          console.error('[useDualSTT] Error disconnecting fallback ElevenLabs adapter:', e);
        }
        fallbackElevenLabsRef.current = null;
      }
      usingFallbackRef.current = false;
    }
  }, [cleanupEventListeners]);

  // Helper to create on-demand adapter connection
  const createOnDemandAdapters = useCallback(async (): Promise<{
    openai: BaseProviderAdapter | null;
    elevenlabs: BaseProviderAdapter | null;
  }> => {
    console.log('[useDualSTT] Creating on-demand connections (fallback mode)...');

    let openaiAdapter: BaseProviderAdapter | null = null;
    let elevenlabsAdapter: BaseProviderAdapter | null = null;

    // Fetch tokens and create adapters in parallel
    const [openaiResult, elevenlabsResult] = await Promise.allSettled([
      // OpenAI
      (async () => {
        const response = await fetch(OPENAI_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`OpenAI token fetch failed: ${response.status}`);
        const data = await response.json();

        const adapter = new OpenAIRealtimeAdapter();
        adapter.configure({
          token: data.token,
          websocketUrl: data.websocketUrl,
          model: 'gpt-4o-realtime-preview',
          language: 'en',
        });
        await adapter.connect();
        return adapter;
      })(),
      // ElevenLabs
      (async () => {
        const response = await fetch(ELEVENLABS_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`ElevenLabs token fetch failed: ${response.status}`);
        const data = await response.json();

        const adapter = new ElevenLabsRealtimeAdapter();
        adapter.configure({
          token: data.token,
          websocketUrl: data.websocketUrl,
          language: 'en',
        });
        await adapter.connect();
        return adapter;
      })(),
    ]);

    if (openaiResult.status === 'fulfilled') {
      openaiAdapter = openaiResult.value;
      console.log('[useDualSTT] OpenAI fallback adapter connected');
    } else {
      console.error('[useDualSTT] OpenAI fallback connection failed:', openaiResult.reason);
    }

    if (elevenlabsResult.status === 'fulfilled') {
      elevenlabsAdapter = elevenlabsResult.value;
      console.log('[useDualSTT] ElevenLabs fallback adapter connected');
    } else {
      console.error('[useDualSTT] ElevenLabs fallback connection failed:', elevenlabsResult.reason);
    }

    return { openai: openaiAdapter, elevenlabs: elevenlabsAdapter };
  }, []);

  // Start recording - uses pool if ready, falls back to on-demand connections
  const startRecording = useCallback(async () => {
    errorRef.current = null;

    // Increment recording cycle ID to invalidate any pending timeouts
    recordingCycleRef.current += 1;
    const currentCycle = recordingCycleRef.current;

    // Clean up any existing audio resources
    cleanup();

    try {
      // Update store state FIRST
      storeStartRecording();
      recordingStartTimeRef.current = Date.now();

      let openaiAdapter: BaseProviderAdapter | null = null;
      let elevenlabsAdapter: BaseProviderAdapter | null = null;

      // Try to use pool if ready, otherwise fall back to on-demand
      if (poolIsReady) {
        console.log('[useDualSTT] Using pre-connected adapters from pool');
        usingFallbackRef.current = false;

        // Reset adapters for new recording (clears transcript, keeps connection)
        resetAdaptersForNewRecording();

        // Get pre-connected adapters from pool (INSTANT!)
        openaiAdapter = getAdapter('openai');
        elevenlabsAdapter = getAdapter('elevenlabs');
      } else {
        console.log('[useDualSTT] Pool not ready, using fallback on-demand connections');
        usingFallbackRef.current = true;

        // Create on-demand connections (this has latency but works without pool)
        const fallbackAdapters = await createOnDemandAdapters();
        openaiAdapter = fallbackAdapters.openai;
        elevenlabsAdapter = fallbackAdapters.elevenlabs;

        // Store in refs for cleanup
        fallbackOpenAIRef.current = openaiAdapter;
        fallbackElevenLabsRef.current = elevenlabsAdapter;
      }

      // Check if we have at least one adapter
      if (!openaiAdapter && !elevenlabsAdapter) {
        throw new Error('Failed to connect to any STT provider');
      }

      // Set up event listeners on adapters
      if (openaiAdapter) {
        if (openaiAdapter.isConnected()) {
          const cleanupFns = setupProviderEvents(openaiAdapter, 'openai');
          eventCleanupRef.current.push(...cleanupFns);
          updateProviderStatus('openai', 'listening');
        } else {
          setProviderError('openai', 'Adapter not connected');
        }
      } else {
        setProviderError('openai', 'No adapter available');
      }

      if (elevenlabsAdapter) {
        if (elevenlabsAdapter.isConnected()) {
          const cleanupFns = setupProviderEvents(elevenlabsAdapter, 'elevenlabs');
          eventCleanupRef.current.push(...cleanupFns);
          updateProviderStatus('elevenlabs', 'listening');
        } else {
          setProviderError('elevenlabs', 'Adapter not connected');
        }
      } else {
        setProviderError('elevenlabs', 'No adapter available');
      }

      // Request microphone permission (~50ms if cached)
      const stream = await requestMicPermission();
      mediaStreamRef.current = stream;

      // Create audio chunker and START IMMEDIATELY
      const chunker = createAudioChunker(
        stream,
        (chunk: ArrayBuffer) => {
          // Send to adapters
          if (openaiAdapter?.isConnected()) {
            openaiAdapter.sendAudio(chunk);
          }
          if (elevenlabsAdapter?.isConnected()) {
            elevenlabsAdapter.sendAudio(chunk);
          }
        },
        {
          sampleRate: 16000,
          chunkSize: 4096,
          mono: true,
        }
      );

      audioChunkerRef.current = chunker;
      chunker.start();

      console.log('[useDualSTT] Recording started' + (usingFallbackRef.current ? ' (fallback mode)' : ' (pool mode)'));

      // Set up max recording timeout
      const maxDuration = appConfig.timeouts.maxRecordingMs;
      setTimeout(() => {
        if (recordingCycleRef.current === currentCycle &&
            useSessionStore.getState().recordingState === 'listening') {
          stopRecording();
        }
      }, maxDuration);

    } catch (error) {
      console.error('[useDualSTT] Failed to start recording:', error);
      errorRef.current = error instanceof Error ? error.message : 'Recording failed';
      cleanup();
      storeStopRecording();
    }
  }, [
    poolIsReady,
    storeStartRecording,
    resetAdaptersForNewRecording,
    getAdapter,
    createOnDemandAdapters,
    setupProviderEvents,
    updateProviderStatus,
    setProviderError,
    cleanup,
    storeStopRecording,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    const cycleAtStop = recordingCycleRef.current;

    storeStopRecording();

    // Stop audio chunker
    if (audioChunkerRef.current) {
      audioChunkerRef.current.stop();
      audioChunkerRef.current = null;
    }

    // Stop microphone
    if (mediaStreamRef.current) {
      stopMicStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    }

    // Get adapters from pool and signal end of audio
    const openaiAdapter = getAdapter('openai');
    const elevenlabsAdapter = getAdapter('elevenlabs');

    if (openaiAdapter?.isConnected()) {
      openaiAdapter.endAudio();
    }
    if (elevenlabsAdapter?.isConnected()) {
      elevenlabsAdapter.endAudio();
    }

    // Wait for finalization or timeout
    const finalizationTimeout = appConfig.timeouts.finalizationMs;

    setTimeout(() => {
      // Check if this timeout is still for the current recording cycle
      if (recordingCycleRef.current !== cycleAtStop) {
        console.log('[useDualSTT] Ignoring stale finalization timeout');
        return;
      }

      const state = useSessionStore.getState();

      // If providers haven't completed, force completion with last known transcript
      if (state.openaiResult.status !== 'completed') {
        const openaiTranscript = state.openaiResult.transcript;
        if (openaiTranscript.committedText || openaiTranscript.interimText) {
          useSessionStore.getState().updateProviderTranscript('openai', {
            finalText: openaiTranscript.committedText || openaiTranscript.interimText,
          });
          computeScores('openai');
        }
      }

      if (state.elevenlabsResult.status !== 'completed') {
        const elevenlabsTranscript = state.elevenlabsResult.transcript;
        if (elevenlabsTranscript.committedText || elevenlabsTranscript.interimText) {
          useSessionStore.getState().updateProviderTranscript('elevenlabs', {
            finalText: elevenlabsTranscript.committedText || elevenlabsTranscript.interimText,
          });
          computeScores('elevenlabs');
        }
      }

      // Ensure recording state is completed
      setRecordingCompleted();

      // Clean up event listeners (but NOT adapters - pool keeps them for reuse)
      cleanupEventListeners();

    }, finalizationTimeout);

  }, [
    storeStopRecording,
    getAdapter,
    computeScores,
    setRecordingCompleted,
    cleanupEventListeners,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    startRecording,
    stopRecording,
    isRecording: recordingState === 'listening',
    isPoolReady: poolIsReady,
    isPoolInitializing: poolIsInitializing,
    error: errorRef.current || poolError,
  };
}

export default useDualSTT;
